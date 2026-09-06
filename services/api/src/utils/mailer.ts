import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";
import { AppError } from "./AppError";

interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string) {
    logger.info(`[dev] Email to ${to}: ${subject} — ${body}`);
  }
}

class SmtpEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string) {
    if (!env.SMTP_URL) {
      throw new AppError("INTERNAL_ERROR", "SMTP_URL not configured", 500);
    }
    const transport = nodemailer.createTransport(env.SMTP_URL);
    await transport.sendMail({ from: env.EMAIL_FROM, to, subject, text: body });
  }
}

function getEmailProvider(): EmailProvider {
  return env.EMAIL_PROVIDER === "smtp" ? new SmtpEmailProvider() : new ConsoleEmailProvider();
}

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await getEmailProvider().send(to, subject, body);
}
