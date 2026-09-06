import express, { type Request } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { apiRouter } from "./routes/index";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrls, credentials: true }));
// rawBody is needed to verify the Razorpay webhook's HMAC signature (express.json() has already
// consumed the stream by the time a handler runs, so it must be captured here).
app.use(express.json({ limit: "10mb", verify: (req, _res, buf) => ((req as Request).rawBody = buf) }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "Beaverr API running" });
});

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;
