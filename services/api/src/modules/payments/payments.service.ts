import { paymentsRepository } from "./payments.repository";
import { residentsRepository } from "../residents/residents.repository";
import { unitsRepository } from "../units/units.repository";
import { schedulePaymentReminders } from "../../queues/payment-reminder.queue";
import { notificationsService } from "../notifications/notifications.service";
import { emitPaymentReceived } from "../../realtime/socket";
import { createOrder, verifyWebhookSignature } from "../../utils/razorpay";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import type { Pagination } from "../../utils/pagination";
import type { PaymentStatus, PaymentType } from "@repo/types";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; amount: number } };
  };
}

export const paymentsService = {
  async listMine(societyId: string, userId: string, filter: { status?: PaymentStatus; type?: PaymentType }, pagination: Pagination) {
    const [payments, total] = await paymentsRepository.list(societyId, { ...filter, userId }, pagination);
    return { payments, total };
  },

  async listForAdmin(societyId: string, filter: { status?: PaymentStatus; type?: PaymentType }, pagination: Pagination) {
    const [payments, total] = await paymentsRepository.list(societyId, filter, pagination);
    return { payments, total };
  },

  async getById(societyId: string, id: string, userId: string, isAdmin: boolean) {
    const payment = await paymentsRepository.findById(societyId, id);
    if (!payment) throw new AppError("NOT_FOUND", "Payment not found.", 404);
    if (!isAdmin && payment.userId !== userId) {
      throw new AppError("FORBIDDEN", "You can only view your own payments.", 403);
    }
    return payment;
  },

  async createDue(
    societyId: string,
    data: { userId: string; unitId: string; amount: number; type: PaymentType; dueDate?: Date },
  ) {
    // Both must resolve inside the admin's own society — otherwise an admin could write a due
    // against a user/unit belonging to a different society entirely.
    const [resident, unit] = await Promise.all([
      residentsRepository.findById(societyId, data.userId),
      unitsRepository.findById(societyId, data.unitId),
    ]);
    if (!resident) throw new AppError("NOT_FOUND", "Resident not found in this society.", 404);
    if (!unit) throw new AppError("NOT_FOUND", "Unit not found in this society.", 404);

    const payment = await paymentsRepository.create(societyId, data);
    if (data.dueDate) {
      await schedulePaymentReminders(payment.id, data.dueDate);
    }
    return payment;
  },

  summary(societyId: string) {
    return paymentsRepository.summary(societyId);
  },

  /** Creates a Razorpay order for an existing PENDING due — never creates arbitrary new charges. */
  async initiate(societyId: string, id: string, userId: string) {
    const payment = await paymentsService.getById(societyId, id, userId, false);
    if (payment.status !== "PENDING") {
      throw new AppError("VALIDATION_ERROR", "This payment is not pending.", 400);
    }
    const order = await createOrder(payment.amount, payment.id);
    await paymentsRepository.update(id, { gatewayRef: order.id });
    return { order, payment };
  },

  /** Status is only ever set here, from a signature-verified webhook — never from a frontend call. */
  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      throw new AppError("PAYMENT_SIGNATURE_INVALID", "Razorpay webhook signature mismatch.", 400);
    }
    const body = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhookPayload;
    const orderId = body.payload.payment?.entity.order_id;
    if (!orderId) return;

    const payment = await paymentsRepository.findByGatewayRef(orderId);
    if (!payment) return;

    // updateIfStatus only applies (and returns count 1) if the row is still in the expected
    // state — makes this handler idempotent against Razorpay retries/replays and stops a stale
    // event from moving a payment backward out of a later terminal state.
    if (body.event === "payment.captured") {
      const updated = await paymentsRepository.updateIfStatus(payment.id, "PENDING", {
        status: "PAID",
        paidAt: new Date(),
      });
      if (updated === 0) {
        logger.info(`Ignoring duplicate/stale payment.captured for ${payment.id} (already ${payment.status})`);
        return;
      }
      emitPaymentReceived(payment.userId, { paymentId: payment.id, amount: payment.amount });
      await notificationsService.create({
        societyId: payment.societyId,
        userId: payment.userId,
        category: "PAYMENT_RECEIVED",
        title: "Payment received",
        body: `Your payment of ₹${payment.amount} was received.`,
      });
    } else if (body.event === "payment.failed") {
      const updated = await paymentsRepository.updateIfStatus(payment.id, "PENDING", { status: "FAILED" });
      if (updated === 0) return;
      await notificationsService.create({
        societyId: payment.societyId,
        userId: payment.userId,
        category: "PAYMENT_FAILED",
        title: "Payment failed",
        body: `Your payment of ₹${payment.amount} did not go through. Please try again.`,
      });
    } else if (body.event === "refund.processed") {
      await paymentsRepository.updateIfStatus(payment.id, "PAID", { status: "REFUNDED" });
    }
  },
};
