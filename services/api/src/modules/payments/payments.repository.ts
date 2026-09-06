import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { PaymentStatus, PaymentType } from "@repo/types";

interface ListFilter {
  userId?: string;
  status?: PaymentStatus;
  type?: PaymentType;
}

export const paymentsRepository = {
  list(societyId: string, filter: ListFilter, pagination: Pagination) {
    const where = {
      societyId,
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.type ? { type: filter.type } : {}),
    };
    return prisma.$transaction([
      prisma.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.payment.count({ where }),
    ]);
  },

  findById(societyId: string, id: string) {
    return prisma.payment.findFirst({ where: { id, societyId } });
  },

  // Webhook lookup: Razorpay doesn't tell us which society before we look up the order, so this is
  // the one query in the module not scoped by societyId — safe because gatewayRef is an exact match
  // on an unguessable Razorpay-generated order id, never a user-suppliable value.
  findByGatewayRef(gatewayRef: string) {
    return prisma.payment.findFirst({ where: { gatewayRef } });
  },

  create(societyId: string, data: { userId: string; unitId: string; amount: number; type: PaymentType; dueDate?: Date }) {
    return prisma.payment.create({ data: { societyId, ...data } });
  },

  update(
    id: string,
    data: Partial<{ status: PaymentStatus; gatewayRef: string; paidAt: Date }>,
  ) {
    return prisma.payment.update({ where: { id }, data });
  },

  /** Only applies the update if the row is still in expectedStatus — makes webhook handling
   * idempotent against retries/replays and stops a stale event from moving a payment backward
   * out of a later terminal state. Returns the row count actually updated (0 or 1). */
  async updateIfStatus(
    id: string,
    expectedStatus: PaymentStatus,
    data: Partial<{ status: PaymentStatus; paidAt: Date }>,
  ) {
    const result = await prisma.payment.updateMany({ where: { id, status: expectedStatus }, data });
    return result.count;
  },

  async summary(societyId: string) {
    const [paid, pending, overdueCount] = await Promise.all([
      prisma.payment.aggregate({ where: { societyId, status: "PAID" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { societyId, status: "PENDING" }, _sum: { amount: true } }),
      prisma.payment.count({ where: { societyId, status: "PENDING", dueDate: { lt: new Date() } } }),
    ]);
    return {
      collected: paid._sum.amount ?? 0,
      outstanding: pending._sum.amount ?? 0,
      overdueCount,
    };
  },
};
