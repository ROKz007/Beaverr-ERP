import { z } from "zod";

export const paymentTypeSchema = z.enum(["MAINTENANCE", "SERVICE"]);
export const paymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);

export const listPaymentsSchema = z.object({
  status: paymentStatusSchema.optional(),
  type: paymentTypeSchema.optional(),
});

export const createDueSchema = z.object({
  userId: z.string().min(1),
  unitId: z.string().min(1),
  amount: z.number().positive(),
  type: paymentTypeSchema,
  dueDate: z.coerce.date().optional(),
});
