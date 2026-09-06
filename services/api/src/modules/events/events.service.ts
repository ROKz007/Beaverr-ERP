import { eventsRepository } from "./events.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

// No user-fan-out notification on publish — the docs call for "push notification on new event
// publication" but that means messaging every resident in the society, and there's no broadcast
// helper (notificationsService.create is per-user); out of scope for this stretch phase.

function withCount<T extends { _count: { rsvps: number } }>(event: T) {
  const { _count, ...rest } = event;
  return { ...rest, rsvpCount: _count.rsvps };
}

export const eventsService = {
  async list(societyId: string, userId: string, pagination: Pagination, includePast = false) {
    const [rawEvents, total] = await eventsRepository.list(societyId, pagination, includePast);
    const myRsvps = await eventsRepository.findMyRsvpsForEvents(
      userId,
      rawEvents.map((e) => e.id),
    );
    const headcountByEvent = new Map(myRsvps.map((r) => [r.eventId, r.headcount]));
    const events = rawEvents.map((e) => ({ ...withCount(e), myHeadcount: headcountByEvent.get(e.id) ?? null }));
    return { events, total };
  },

  async getById(societyId: string, id: string, userId: string) {
    const event = await eventsRepository.findById(societyId, id);
    if (!event) throw new AppError("NOT_FOUND", "Event not found.", 404);
    const mine = await eventsRepository.findMyRsvp(id, userId);
    return { ...withCount(event), myHeadcount: mine?.headcount ?? null };
  },

  create: eventsRepository.create,

  async update(societyId: string, id: string, data: Parameters<typeof eventsRepository.update>[1]) {
    await eventsService.assertExists(societyId, id);
    return eventsRepository.update(id, data);
  },

  async softDelete(societyId: string, id: string) {
    await eventsService.assertExists(societyId, id);
    return eventsRepository.softDelete(id);
  },

  async assertExists(societyId: string, id: string) {
    const event = await eventsRepository.findById(societyId, id);
    if (!event) throw new AppError("NOT_FOUND", "Event not found.", 404);
    return event;
  },

  async rsvp(societyId: string, id: string, userId: string, headcount: number) {
    await eventsService.assertExists(societyId, id);
    return eventsRepository.upsertRsvp(id, userId, headcount);
  },

  async cancelRsvp(societyId: string, id: string, userId: string) {
    await eventsService.assertExists(societyId, id);
    const existing = await eventsRepository.findMyRsvp(id, userId);
    if (!existing) return null; // idempotent — no RSVP to cancel is a no-op, not an error
    return eventsRepository.deleteRsvp(id, userId);
  },
};
