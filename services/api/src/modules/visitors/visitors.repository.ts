import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { VisitorStatus } from "@repo/types";

interface ListFilter {
  status?: VisitorStatus;
  residentId?: string;
  isBlacklisted?: boolean;
}

export const visitorsRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.residentId ? { residentId: filter.residentId } : {}),
      ...(typeof filter.isBlacklisted === "boolean" ? { isBlacklisted: filter.isBlacklisted } : {}),
    };
    return prisma.$transaction([
      prisma.visitor.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.visitor.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.visitor.findFirst({ where: { id, societyId } });
  },

  findByQrToken(societyId: string, qrToken: string) {
    return prisma.visitor.findFirst({ where: { societyId, qrToken } });
  },

  isPhoneBlacklisted(societyId: string, phone: string) {
    return prisma.visitor.findFirst({ where: { societyId, visitorPhone: phone, isBlacklisted: true } });
  },

  create(data: {
    societyId: string;
    residentId: string;
    visitorName: string;
    visitorPhone?: string;
    photoUrl?: string;
    qrToken?: string;
    status: VisitorStatus;
  }) {
    return prisma.visitor.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      status: VisitorStatus;
      entryAt: Date;
      exitAt: Date;
      isBlacklisted: boolean;
    }>,
  ) {
    return prisma.visitor.update({ where: { id }, data });
  },
};
