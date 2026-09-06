import { z } from "zod";

export const serviceCategorySchema = z.enum(["MAINTENANCE", "AMENITY", "COMMUNITY"]);

export const listServicesSchema = z.object({
  q: z.string().max(120).optional(),
  category: serviceCategorySchema.optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(1).max(2000),
  category: serviceCategorySchema,
  subCategory: z.string().min(1).max(120),
  isPaid: z.boolean().default(true),
  price: z.number().positive().optional(),
  slaHours: z.number().int().positive().default(24),
  durationEstMins: z.number().int().positive().default(60),
});

// Not createServiceSchema.partial() — .partial() wraps isPaid/slaHours/durationEstMins' .default()s
// in an outer .optional(), and the default still fires whenever a field is omitted, silently
// resetting it on any partial update that doesn't mention it (e.g. a rename-only PATCH would reset
// slaHours to 24 and durationEstMins to 60).
export const updateServiceSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: serviceCategorySchema.optional(),
  subCategory: z.string().min(1).max(120).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().positive().optional(),
  slaHours: z.number().int().positive().optional(),
  durationEstMins: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
