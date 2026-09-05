import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "./logger";
import { AppError } from "./AppError";

const OTP_TTL_SECONDS = 5 * 60;
const SEND_LIMIT = 3;
const VERIFY_LIMIT = 5;

interface OtpProvider {
  send(phone: string, code: string): Promise<void>;
}

class ConsoleOtpProvider implements OtpProvider {
  async send(phone: string, code: string) {
    logger.info(`[dev] OTP for ${phone}: ${code}`);
  }
}

class Msg91OtpProvider implements OtpProvider {
  async send(phone: string, code: string) {
    const authKey = env.MSG91_AUTH_KEY;
    const templateId = env.MSG91_TEMPLATE_ID;
    if (!authKey || !templateId) {
      throw new AppError("INTERNAL_ERROR", "MSG91_AUTH_KEY/MSG91_TEMPLATE_ID not configured", 500);
    }
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json", authkey: authKey },
      body: JSON.stringify({ template_id: templateId, mobile: phone, otp: code }),
    });
    if (!response.ok) {
      throw new AppError("INTERNAL_ERROR", "Failed to send OTP via MSG91", 502);
    }
  }
}

function getOtpProvider(): OtpProvider {
  return env.OTP_PROVIDER === "msg91" ? new Msg91OtpProvider() : new ConsoleOtpProvider();
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(phone: string): Promise<void> {
  const sendCountKey = `otp:send-count:${phone}`;
  const attempts = await redis.incr(sendCountKey);
  if (attempts === 1) {
    await redis.expire(sendCountKey, OTP_TTL_SECONDS);
  }
  if (attempts > SEND_LIMIT) {
    throw new AppError("OTP_RATE_LIMITED", "Too many OTP requests. Try again in 5 minutes.", 429);
  }

  const code = generateOtp();
  await redis.set(`otp:code:${phone}`, code, "EX", OTP_TTL_SECONDS);
  await redis.set(`otp:verify-count:${phone}`, "0", "EX", OTP_TTL_SECONDS);
  await getOtpProvider().send(phone, code);
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  const verifyCountKey = `otp:verify-count:${phone}`;
  const attempts = await redis.incr(verifyCountKey);
  if (attempts === 1) {
    await redis.expire(verifyCountKey, OTP_TTL_SECONDS);
  }
  if (attempts > VERIFY_LIMIT) {
    throw new AppError("OTP_RATE_LIMITED", "Too many attempts. Request a new OTP.", 429);
  }

  const codeKey = `otp:code:${phone}`;
  const storedCode = await redis.get(codeKey);
  if (!storedCode) {
    throw new AppError("OTP_EXPIRED", "OTP has expired. Request a new one.", 400);
  }
  if (storedCode !== code) {
    throw new AppError("OTP_INVALID", "OTP does not match.", 400);
  }
  await redis.del(codeKey);
}
