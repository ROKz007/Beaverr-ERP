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

export const updateWorkerSchema = createWorkerSchema.partial();
