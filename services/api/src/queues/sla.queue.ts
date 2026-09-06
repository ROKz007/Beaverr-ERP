import { Queue, Worker as QueueWorker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";

// BullMQ needs its own connection (maxRetriesPerRequest: null), separate from the shared app redis client.
const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const slaQueue = new Queue("booking-sla", { connection });

/** Schedules an SLA check to fire slaHours after booking creation. jobId = bookingId so it's naturally idempotent. */
export function scheduleSlaCheck(bookingId: string, slaHours: number) {
  return slaQueue.add("check", { bookingId }, { jobId: bookingId, delay: slaHours * 60 * 60 * 1000 });
}

const OPEN_STATUSES = new Set(["PENDING", "CONFIRMED"]);

/** Rule-based SLA engine: if a booking is still unstarted when its SLA window closes, notify the society admin. */
export function startSlaWorker() {
  return new QueueWorker(
    "booking-sla",
    async (job) => {
      const { bookingId } = job.data as { bookingId: string };
      const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
      if (!booking || !OPEN_STATUSES.has(booking.status)) return;

      const society = await prisma.society.findUnique({ where: { id: booking.societyId } });
      if (!society?.adminUserId) return;

      await prisma.notification.create({
        data: {
          societyId: booking.societyId,
          userId: society.adminUserId,
          category: "SLA_BREACH",
          title: "Booking SLA breached",
          body: `Booking ${booking.id} is still ${booking.status} past its SLA window.`,
        },
      });
      logger.warn(`SLA breach: booking ${booking.id} still ${booking.status}`);
    },
    { connection },
  );
}
