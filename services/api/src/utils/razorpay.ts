import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "./AppError";

function getClient(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError("INTERNAL_ERROR", "Razorpay is not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing).", 500);
  }
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

/** Amount in paise (Razorpay's smallest unit), receipt should be the Payment row's id. */
export async function createOrder(amountRupees: number, receipt: string) {
  return getClient().orders.create({
    amount: Math.round(amountRupees * 100),
    currency: "INR",
    receipt,
  });
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  return expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf);
}
