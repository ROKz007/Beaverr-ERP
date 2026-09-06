import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";

interface ListFilter {
  q?: string;
  skill?: string;
  isAvailable?: boolean;
}

interface WorkerInput {
  name: string;
  phone: string;
  skills: string[];
  isVerified: boolean;
  isAvailable: boolean;
}

export const workersRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      deletedAt: null,
      ...(typeof filter.isAvailable === "boolean" ? { isAvailable: filter.isAvailable } : {}),
      ...(filter.skill ? { skills: { has: filter.skill } } : {}),
      ...(filter.q
        ? {
            OR: [
              { name: { contains: filter.q, mode: "insensitive" as const } },
              { phone: { contains: filter.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return prisma.$transaction([
      prisma.worker.findMany({ where, orderBy: { reputationScore: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.worker.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.worker.findFirst({ where: { id, societyId, deletedAt: null } });
  },

  /** Rule-based auto-assign: best-reputation available worker with a matching skill. */
  findBestMatch(societyId: string, skill: string) {
    return prisma.worker.findFirst({
      where: { societyId, deletedAt: null, isAvailable: true, isVerified: true, skills: { has: skill } },
      orderBy: { reputationScore: "desc" },
    });
  },

  create(societyId: string, data: WorkerInput) {
    return prisma.worker.create({ data: { societyId, ...data } });
  },

  update(id: string, data: Partial<WorkerInput> & { ratingAvg?: number; reputationScore?: number }) {
    return prisma.worker.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.worker.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } });
  },
};
