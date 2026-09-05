import winston from "winston";
import { env } from "../config/env";

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "beaverr-api" },
  transports: [new winston.transports.Console()],
});
