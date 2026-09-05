import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  address: z.string().min(2).max(300).optional(),
});

export const gateModuleSchema = z.object({
  isRestrictedEntry: z.boolean(),
});

export const departmentSchema = z.object({
  name: z.string().min(2).max(120),
  contactName: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(20).optional(),
  email: z.string().email().optional(),
  workingHours: z.string().max(120).optional(),
});

export const updateDepartmentSchema = departmentSchema.partial();
