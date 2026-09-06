import http from "node:http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { initSocket } from "./realtime/socket";
import { startSlaWorker } from "./queues/sla.queue";
import { startGrievanceEscalationWorker } from "./queues/grievance-escalation.queue";
import { startPaymentReminderWorker } from "./queues/payment-reminder.queue";

const httpServer = http.createServer(app);
initSocket(httpServer);
startSlaWorker();
startGrievanceEscalationWorker();
startPaymentReminderWorker();

httpServer.listen(env.PORT, () => {
  logger.info(`Beaverr API running on port ${env.PORT}`);
});
