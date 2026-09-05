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

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});
