import { z } from "zod";

export const registerSchema = z.object({
  societyCode: z.string().length(6),
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional(),
});

export const phoneSchema = z.object({
  phone: z.string().min(6).max(20),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(6).max(20),
  code: z.string().length(6),
});

export const guardLoginSchema = z.object({
  phone: z.string().min(6).max(20),
  password: z.string().min(1),
});

export const updateMeSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  avatarUrl: z.string().url().optional(),
});
