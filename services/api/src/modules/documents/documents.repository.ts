import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

export const documentsRepository = {
  list(societyId: string, pagination: Pagination) {
    const where = { societyId };
    return prisma.$transaction([
      prisma.document.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.document.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.document.findFirst({ where: { id, societyId } });
  },

  create(societyId: string, uploadedByUserId: string, data: { title: string; url: string; category: string }) {
    return prisma.document.create({ data: { societyId, uploadedByUserId, ...data } });
  },

  remove(id: string) {
    return prisma.document.delete({ where: { id } });
  },
};
