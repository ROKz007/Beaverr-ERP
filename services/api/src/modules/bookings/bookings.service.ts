import { bookingsRepository } from "./bookings.repository";
import { servicesRepository } from "../services/services.repository";
import { workersRepository } from "../workers/workers.repository";
import { workersService } from "../workers/workers.service";
import { scheduleSlaCheck } from "../../queues/sla.queue";
import { emitBookingUpdate } from "../../realtime/socket";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { BookingStatus } from "@repo/types";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "RESCHEDULED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "RESCHEDULED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  RESCHEDULED: ["PENDING", "CONFIRMED", "CANCELLED"],
  COMPLETED: ["RATED"],
  CANCELLED: [],
  RATED: [],
};

function assertTransition(current: BookingStatus, next: BookingStatus) {
  if (!TRANSITIONS[current].includes(next)) {
    throw new AppError("INVALID_TRANSITION", `Cannot move booking from ${current} to ${next}.`, 400);
  }
}

// Admin-web's bookings table needs to show who booked; residents already know that about themselves.
async function attachResidents<T extends { residentId: string }>(societyId: string, bookings: T[]) {
  const ids = [...new Set(bookings.map((b) => b.residentId))];
  const residents = await bookingsRepository.findResidentSummaries(societyId, ids);
  const byId = new Map(residents.map((r) => [r.id, r]));
  return bookings.map((b) => ({ ...b, resident: byId.get(b.residentId) ?? null }));
}

export const bookingsService = {
  async list(
    societyId: string,
    filter: { status?: BookingStatus; serviceId?: string; workerId?: string; residentId?: string },
    pagination: Pagination,
  ) {
    const [rawBookings, total] = await bookingsRepository.list(societyId, filter, pagination);
    const bookings = await attachResidents(societyId, rawBookings);
    return { bookings, total };
  },

  async getById(societyId: string, id: string) {
    const booking = await bookingsRepository.findById(societyId, id);
    if (!booking) throw new AppError("NOT_FOUND", "Booking not found.", 404);
    return booking;
  },

  /** Creates the booking, then runs rule-based auto-assign (best-reputation available worker matching the service's subCategory) and schedules the SLA check. */
  async create(societyId: string, residentId: string, input: { serviceId: string; scheduledAt: Date }) {
    const service = await servicesRepository.findById(societyId, input.serviceId);
    if (!service) throw new AppError("NOT_FOUND", "Service not found.", 404);

    let booking = await bookingsRepository.create({
      societyId,
      serviceId: input.serviceId,
      residentId,
      scheduledAt: input.scheduledAt,
    });

    const match = await workersRepository.findBestMatch(societyId, service.subCategory);
    if (match) {
      booking = await bookingsRepository.update(booking.id, { status: "CONFIRMED", workerId: match.id });
    }

    await scheduleSlaCheck(booking.id, service.slaHours);
    emitBookingUpdate(booking.id, booking);
    return booking;
  },

  async assignWorker(societyId: string, id: string, workerId: string) {
    const booking = await this.getById(societyId, id);
    const worker = await workersRepository.findById(societyId, workerId);
    if (!worker) throw new AppError("NOT_FOUND", "Worker not found.", 404);
    const status = booking.status === "PENDING" ? "CONFIRMED" : booking.status;
    const updated = await bookingsRepository.update(id, { workerId, status });
    emitBookingUpdate(id, updated);
    return updated;
  },

  async updateStatus(societyId: string, id: string, status: BookingStatus, scheduledAt?: Date) {
    const booking = await this.getById(societyId, id);
    assertTransition(booking.status, status);
    if (status === "RESCHEDULED" && !scheduledAt) {
      throw new AppError("VALIDATION_ERROR", "scheduledAt is required when rescheduling.", 400);
    }
    const updated = await bookingsRepository.update(id, {
      status,
      ...(scheduledAt ? { scheduledAt } : {}),
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    });
    emitBookingUpdate(id, updated);
    return updated;
  },

  async cancel(societyId: string, id: string, requesterId: string, isAdmin: boolean) {
    const booking = await this.getById(societyId, id);
    if (!isAdmin && booking.residentId !== requesterId) {
      throw new AppError("FORBIDDEN", "You can only cancel your own bookings.", 403);
    }
    assertTransition(booking.status, "CANCELLED");
    const updated = await bookingsRepository.update(id, { status: "CANCELLED" });
    emitBookingUpdate(id, updated);
    return updated;
  },

  async rate(societyId: string, id: string, residentId: string, rating: number, ratingNote?: string) {
    const booking = await this.getById(societyId, id);
    if (booking.residentId !== residentId) {
      throw new AppError("FORBIDDEN", "You can only rate your own bookings.", 403);
    }
    assertTransition(booking.status, "RATED");
    const updated = await bookingsRepository.update(id, { status: "RATED", rating, ratingNote });
    if (booking.workerId) {
      const worker = await workersRepository.findById(societyId, booking.workerId);
      if (worker) await workersService.recordRating(worker, rating);
    }
    emitBookingUpdate(id, updated);
    return updated;
  },
};
