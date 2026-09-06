import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  OTP_PROVIDER: z.enum(["console", "msg91"]).default("console"),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  SMTP_URL: z.string().optional(),
  EMAIL_FROM: z.string().default("noreply@beaverr.demo"),
  // No defaults — these are secrets used for signing/verification. A known placeholder default
  // would let anyone forge a valid webhook signature if a deployment forgets to set the real one.
  // Missing/unset means "Razorpay not configured": order creation fails with a clear error and
  // webhook verification fails closed, rather than silently trusting a public string.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  FRONTEND_URLS: z.string().default("http://localhost:3000,http://localhost:3001"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — check .env against .env.example");
}

export const env = {
  ...parsed.data,
  frontendUrls: parsed.data.FRONTEND_URLS.split(",").map((url) => url.trim()),
};
