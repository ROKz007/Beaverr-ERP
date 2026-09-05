import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { Prisma } from "@prisma/client";

export const unitsRepository = {
  list(societyId: string, pagination: Pagination) {
    return prisma.$transaction([
      prisma.unit.findMany({
        where: { societyId, deletedAt: null },
        orderBy: [{ block: "asc" }, { unitNumber: "asc" }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.unit.count({ where: { societyId, deletedAt: null } }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.unit.findFirst({ where: { id, societyId, deletedAt: null } });
  },

  create(societyId: string, data: Prisma.UnitCreateWithoutSocietyInput) {
    return prisma.unit.create({ data: { ...data, society: { connect: { id: societyId } } } });
  },

  update(id: string, data: Prisma.UnitUpdateInput) {
    return prisma.unit.update({ where: { id }, data });
  },

  transfer(id: string, data: { ownerUserId?: string; tenantUserId?: string }) {
    return prisma.unit.update({ where: { id }, data });
  },
};
