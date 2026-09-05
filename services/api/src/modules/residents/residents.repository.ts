import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

export const residentsRepository = {
  list(societyId: string, pagination: Pagination) {
    return prisma.$transaction([
      prisma.user.findMany({
        where: { societyId, role: "RESIDENT", deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.user.count({ where: { societyId, role: "RESIDENT", deletedAt: null } }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.user.findFirst({ where: { id, societyId, role: "RESIDENT", deletedAt: null } });
  },

  findByPhone(societyId: string, phone: string) {
    return prisma.user.findFirst({ where: { societyId, phone, deletedAt: null } });
  },

  create(societyId: string, data: { name: string; phone: string; email?: string }) {
    return prisma.user.create({ data: { societyId, role: "RESIDENT", ...data } });
  },

  update(id: string, data: { name?: string; email?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },
};
