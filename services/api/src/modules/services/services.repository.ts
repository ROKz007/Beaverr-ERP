import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { ServiceCategory } from "@repo/types";

interface ListFilter {
  q?: string;
  category?: ServiceCategory;
}

interface ServiceInput {
  name: string;
  description: string;
  category: ServiceCategory;
  subCategory: string;
  isPaid: boolean;
  price?: number;
  slaHours: number;
  durationEstMins: number;
}

export const servicesRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      deletedAt: null,
      isActive: true,
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.q
        ? {
            OR: [
              { name: { contains: filter.q, mode: "insensitive" as const } },
              { description: { contains: filter.q, mode: "insensitive" as const } },
              { subCategory: { contains: filter.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return prisma.$transaction([
      prisma.service.findMany({ where, orderBy: { name: "asc" }, skip: pagination.skip, take: pagination.take }),
      prisma.service.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.service.findFirst({ where: { id, societyId, deletedAt: null } });
  },

  create(societyId: string, data: ServiceInput) {
    return prisma.service.create({ data: { societyId, ...data } });
  },

  update(id: string, data: Partial<ServiceInput> & { isActive?: boolean }) {
    return prisma.service.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.service.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },
};
