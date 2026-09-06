import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(2).max(160),
  url: z.string().url(),
  category: z.string().min(1).max(60),
});
