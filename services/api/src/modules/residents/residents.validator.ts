import { z } from "zod";

export const createResidentSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional(),
  unitId: z.string().optional(),
});

export const updateResidentSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export const suspendResidentSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(300).optional(),
});
