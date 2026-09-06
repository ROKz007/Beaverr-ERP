import { z } from "zod";

export const listEventsSchema = z.object({
  includePast: z.coerce.boolean().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(1).max(2000),
  category: z.string().min(1).max(60),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const rsvpSchema = z.object({
  headcount: z.number().int().min(1).max(20).default(1),
});
