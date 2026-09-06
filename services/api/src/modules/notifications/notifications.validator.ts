import { z } from "zod";

export const listNotificationsSchema = z.object({
  isRead: z.coerce.boolean().optional(),
  category: z.string().max(60).optional(),
});

export const updatePreferencesSchema = z.object({
  email: z.boolean().optional(),
  inApp: z.boolean().optional(),
});
