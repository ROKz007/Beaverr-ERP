import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

interface ListFilter {
  isRead?: boolean;
  category?: string;
}

export const notificationsRepository = {
  list(userId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      userId,
      ...(typeof filter.isRead === "boolean" ? { isRead: filter.isRead } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    };
    return prisma.$transaction([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.notification.count({ where }),
    ]);
  },

  findById(userId: string, id: string) {
    return prisma.notification.findFirst({ where: { id, userId } });
  },

  create(data: { societyId: string; userId: string; category: string; title: string; body: string }) {
    return prisma.notification.create({ data });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },

  remove(id: string) {
    return prisma.notification.delete({ where: { id } });
  },

  getPreference(userId: string) {
    return prisma.notificationPreference.findUnique({ where: { userId } });
  },

  upsertPreference(userId: string, data: { email?: boolean; inApp?: boolean }) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, email: data.email ?? true, inApp: data.inApp ?? true },
      update: data,
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  },
};
