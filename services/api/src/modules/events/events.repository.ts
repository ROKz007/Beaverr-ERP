import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

interface EventInput {
  title: string;
  description: string;
  category: string;
  startAt: Date;
  endAt?: Date;
}

export const eventsRepository = {
  // includePast: residents only ever want upcoming events (both apps' empty-state copy says "No
  // upcoming events"); admin-web passes includePast=true to still manage/review past ones.
  list(societyId: string, pagination: Pagination, includePast = false) {
    const where = { societyId, deletedAt: null, ...(includePast ? {} : { startAt: { gte: new Date() } }) };
    return prisma.$transaction([
      prisma.event.findMany({
        where,
        include: { _count: { select: { rsvps: true } } },
        orderBy: { startAt: "asc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.event.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.event.findFirst({
      where: { id, societyId, deletedAt: null },
      include: { _count: { select: { rsvps: true } } },
    });
  },

  create(societyId: string, createdByUserId: string, data: EventInput) {
    return prisma.event.create({ data: { societyId, createdByUserId, ...data } });
  },

  update(id: string, data: Partial<EventInput>) {
    return prisma.event.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  findMyRsvp(eventId: string, userId: string) {
    return prisma.eventRsvp.findUnique({ where: { eventId_userId: { eventId, userId } } });
  },

  // Batched — one query for a whole list page instead of one findUnique per event (N+1).
  findMyRsvpsForEvents(userId: string, eventIds: string[]) {
    return prisma.eventRsvp.findMany({ where: { userId, eventId: { in: eventIds } } });
  },

  upsertRsvp(eventId: string, userId: string, headcount: number) {
    return prisma.eventRsvp.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, headcount },
      update: { headcount },
    });
  },

  deleteRsvp(eventId: string, userId: string) {
    return prisma.eventRsvp.delete({ where: { eventId_userId: { eventId, userId } } });
  },
};
