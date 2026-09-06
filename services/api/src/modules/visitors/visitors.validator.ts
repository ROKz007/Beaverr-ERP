import { z } from "zod";

export const visitorStatusSchema = z.enum(["PENDING", "APPROVED", "DENIED", "INSIDE", "EXITED"]);

export const listVisitorsSchema = z.object({
  status: visitorStatusSchema.optional(),
});

export const preApproveVisitorSchema = z.object({
  visitorName: z.string().min(1).max(120),
  visitorPhone: z.string().min(6).max(20).optional(),
});

export const walkinVisitorSchema = z.object({
  residentId: z.string().min(1),
  visitorName: z.string().min(1).max(120),
  visitorPhone: z.string().min(6).max(20).optional(),
  photoUrl: z.string().url().optional(),
});

export const blacklistVisitorSchema = z.object({
  isBlacklisted: z.boolean(),
});
