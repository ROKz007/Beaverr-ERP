import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { BookingStatus } from "@repo/types";

interface ListFilter {
  status?: BookingStatus;
  serviceId?: string;
  workerId?: string;
  residentId?: string;
}

// Residents need the service name/category and (once assigned) the worker's name/phone/rating for
// tracking — joined here rather than exposing the admin-only workers/services endpoints to residents.
const INCLUDE = {
  service: { select: { id: true, name: true, category: true, subCategory: true } },
  worker: { select: { id: true, name: true, phone: true, ratingAvg: true } },
} as const;

export const bookingsRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.serviceId ? { serviceId: filter.serviceId } : {}),
      ...(filter.workerId ? { workerId: filter.workerId } : {}),
      ...(filter.residentId ? { residentId: filter.residentId } : {}),
    };
    return prisma.$transaction([
      prisma.serviceBooking.findMany({
        where,
        include: INCLUDE,
        orderBy: { scheduledAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.serviceBooking.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.serviceBooking.findFirst({ where: { id, societyId, deletedAt: null }, include: INCLUDE });
  },

  create(data: { societyId: string; serviceId: string; residentId: string; scheduledAt: Date }) {
    return prisma.serviceBooking.create({ data, include: INCLUDE });
  },

  update(
    id: string,
    data: Partial<{
      status: BookingStatus;
      workerId: string | null;
      scheduledAt: Date;
      completedAt: Date | null;
      rating: number;
      ratingNote: string;
    }>,
  ) {
    return prisma.serviceBooking.update({ where: { id }, data, include: INCLUDE });
  },
};
