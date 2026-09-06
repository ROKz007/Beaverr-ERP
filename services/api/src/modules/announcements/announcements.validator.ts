import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(1).max(4000),
  isCritical: z.boolean().default(false),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
