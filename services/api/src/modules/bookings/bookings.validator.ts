import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
  "RATED",
]);

export const listBookingsSchema = z.object({
  status: bookingStatusSchema.optional(),
  serviceId: z.string().optional(),
  workerId: z.string().optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  scheduledAt: z.coerce.date(),
});

export const updateStatusSchema = z.object({
  status: bookingStatusSchema,
  scheduledAt: z.coerce.date().optional(),
});

export const assignWorkerSchema = z.object({
  workerId: z.string().min(1),
});

export const rateBookingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  ratingNote: z.string().max(1000).optional(),
});
