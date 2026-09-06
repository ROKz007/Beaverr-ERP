import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { GrievanceStatus, GrievanceType } from "@repo/types";

interface ListFilter {
  status?: GrievanceStatus;
  type?: GrievanceType;
  raisedByUserId?: string;
}

interface CreateInput {
  type: GrievanceType;
  description: string;
  againstUserId?: string;
  mediaUrls: string[];
  isAnonymous: boolean;
}

export const grievancesRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.raisedByUserId ? { raisedByUserId: filter.raisedByUserId } : {}),
    };
    return prisma.$transaction([
      prisma.grievance.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.grievance.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.grievance.findFirst({ where: { id, societyId, deletedAt: null } });
  },

  create(societyId: string, raisedByUserId: string, data: CreateInput) {
    return prisma.grievance.create({ data: { societyId, raisedByUserId, ...data } });
  },

  update(
    id: string,
    data: Partial<{ status: GrievanceStatus; assignedToId: string; resolvedAt: Date | null }>,
  ) {
    return prisma.grievance.update({ where: { id }, data });
  },
};
