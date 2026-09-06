import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

interface AnnouncementInput {
  title: string;
  body: string;
  isCritical: boolean;
}

export const announcementsRepository = {
  list(societyId: string, pagination: Pagination) {
    const where = { societyId, deletedAt: null };
    return prisma.$transaction([
      prisma.announcement.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.announcement.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.announcement.findFirst({ where: { id, societyId, deletedAt: null } });
  },

  create(societyId: string, createdByUserId: string, data: AnnouncementInput) {
    return prisma.announcement.create({ data: { societyId, createdByUserId, ...data } });
  },

  update(id: string, data: Partial<AnnouncementInput>) {
    return prisma.announcement.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  findMyReceipt(announcementId: string, userId: string) {
    return prisma.announcementReadReceipt.findUnique({ where: { announcementId_userId: { announcementId, userId } } });
  },

  // Batched — one query for a whole list page instead of one findUnique per announcement (N+1).
  findMyReceiptsForAnnouncements(userId: string, announcementIds: string[]) {
    return prisma.announcementReadReceipt.findMany({ where: { userId, announcementId: { in: announcementIds } } });
  },

  markRead(announcementId: string, userId: string) {
    return prisma.announcementReadReceipt.upsert({
      where: { announcementId_userId: { announcementId, userId } },
      create: { announcementId, userId },
      update: {},
    });
  },

  countReceipts(announcementId: string) {
    return prisma.announcementReadReceipt.count({ where: { announcementId } });
  },
};
