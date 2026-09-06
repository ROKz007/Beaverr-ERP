import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(1).max(4000),
  isCritical: z.boolean().default(false),
});

// Not createAnnouncementSchema.partial() — .partial() wraps isCritical's .default(false) in an
// outer .optional(), and the default still fires whenever the field is omitted, silently resetting
// isCritical to false on any partial update that doesn't mention it.
export const updateAnnouncementSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  body: z.string().min(1).max(4000).optional(),
  isCritical: z.boolean().optional(),
});
