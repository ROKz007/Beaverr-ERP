import IORedis from "ioredis";
import { env } from "../config/env";

// BullMQ needs its own connection (maxRetriesPerRequest: null), separate from the shared app redis
// client. Shared across all queues/workers in this process.
export const queueConnection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
