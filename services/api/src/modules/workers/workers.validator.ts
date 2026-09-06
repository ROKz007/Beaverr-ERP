import { z } from "zod";

export const listWorkersSchema = z.object({
  q: z.string().max(120).optional(),
  skill: z.string().max(60).optional(),
  isAvailable: z.coerce.boolean().optional(),
});

export const createWorkerSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(20),
  skills: z.array(z.string().min(1).max(60)).min(1),
  isVerified: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

// Not createWorkerSchema.partial() — see services.validator.ts's updateServiceSchema comment.
// Concretely here: admin-web's verify/available toggle buttons each PATCH only the one field they're
// flipping, so .partial() would silently reset the *other* boolean to its default on every toggle.
export const updateWorkerSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(20).optional(),
  skills: z.array(z.string().min(1).max(60)).min(1).optional(),
  isVerified: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});
