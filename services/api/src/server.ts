import http from "node:http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { initSocket } from "./realtime/socket";
import { startSlaWorker } from "./queues/sla.queue";

const httpServer = http.createServer(app);
initSocket(httpServer);
startSlaWorker();

httpServer.listen(env.PORT, () => {
  logger.info(`Beaverr API running on port ${env.PORT}`);
});
