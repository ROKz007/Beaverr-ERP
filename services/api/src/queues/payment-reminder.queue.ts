import { Queue, Worker as QueueWorker } from "bullmq";
import { prisma } from "../config/database";
import { notificationsService } from "../modules/notifications/notifications.service";
import { queueConnection as connection } from "./connection";

export const paymentReminderQueue = new Queue("payment-reminder", { connection });

const REMINDER_OFFSETS_MS = {
  "7d": -7 * 24 * 60 * 60 * 1000,
  "3d": -3 * 24 * 60 * 60 * 1000,
  due: 0,
  overdue: 1 * 24 * 60 * 60 * 1000,
} as const;

const REMINDER_LABEL: Record<keyof typeof REMINDER_OFFSETS_MS, string> = {
  "7d": "is due in 7 days",
  "3d": "is due in 3 days",
  due: "is due today",
  overdue: "is overdue",
};

export function schedulePaymentReminders(paymentId: string, dueDate: Date) {
  return Promise.all(
    (Object.keys(REMINDER_OFFSETS_MS) as (keyof typeof REMINDER_OFFSETS_MS)[]).map((stage) => {
      const fireAt = dueDate.getTime() + REMINDER_OFFSETS_MS[stage];
      const delay = Math.max(0, fireAt - Date.now());
      // BullMQ custom job ids can't contain ":" — use "-" as the separator instead.
      return paymentReminderQueue.add("remind", { paymentId, stage }, { jobId: `${paymentId}-${stage}`, delay });
    }),
  );
}

/** Only reminds while the payment is still PENDING — a paid/failed/refunded due doesn't need nagging. */
export function startPaymentReminderWorker() {
  return new QueueWorker(
    "payment-reminder",
    async (job) => {
      const { paymentId, stage } = job.data as { paymentId: string; stage: keyof typeof REMINDER_OFFSETS_MS };
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status !== "PENDING") return;

      await notificationsService.create({
        societyId: payment.societyId,
        userId: payment.userId,
        category: "PAYMENT_REMINDER",
        title: "Payment reminder",
        body: `Your payment of ₹${payment.amount} ${REMINDER_LABEL[stage]}.`,
      });
    },
    { connection },
  );
}
