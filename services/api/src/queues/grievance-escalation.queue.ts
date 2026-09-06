import { Queue, Worker as QueueWorker } from "bullmq";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { notificationsService } from "../modules/notifications/notifications.service";
import { queueConnection as connection } from "./connection";

// No per-grievance SLA field in the schema (unlike Service.slaHours) — fixed window for MVP.
const ESCALATION_HOURS = 48;

export const grievanceEscalationQueue = new Queue("grievance-escalation", { connection });

export function scheduleGrievanceEscalation(grievanceId: string) {
  return grievanceEscalationQueue.add(
    "check",
    { grievanceId },
    { jobId: grievanceId, delay: ESCALATION_HOURS * 60 * 60 * 1000 },
  );
}

/** If a grievance is still OPEN past the escalation window, notify the society admin. */
export function startGrievanceEscalationWorker() {
  return new QueueWorker(
    "grievance-escalation",
    async (job) => {
      const { grievanceId } = job.data as { grievanceId: string };
      const grievance = await prisma.grievance.findUnique({ where: { id: grievanceId } });
      if (!grievance || grievance.status !== "OPEN") return;

      const society = await prisma.society.findUnique({ where: { id: grievance.societyId } });
      if (!society?.adminUserId) return;

      await notificationsService.create({
        societyId: grievance.societyId,
        userId: society.adminUserId,
        category: "GRIEVANCE_ESCALATION",
        title: "Grievance unresolved past SLA",
        body: `Grievance ${grievance.id} is still OPEN after ${ESCALATION_HOURS} hours.`,
      });
      logger.warn(`Grievance escalation: ${grievance.id} still OPEN`);
    },
    { connection },
  );
}
