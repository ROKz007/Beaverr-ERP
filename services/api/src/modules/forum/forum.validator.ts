import { z } from "zod";

export const forumCategorySchema = z.enum(["FOR_SALE", "LOST_FOUND", "CARPOOL", "RECOMMENDATIONS", "GENERAL"]);

export const listThreadsSchema = z.object({
  category: forumCategorySchema.optional(),
});

export const createThreadSchema = z.object({
  category: forumCategorySchema,
  title: z.string().min(2).max(160),
  body: z.string().min(1).max(4000),
});

export const createReplySchema = z.object({
  body: z.string().min(1).max(2000),
});

export const flagThreadSchema = z.object({
  isFlagged: z.boolean(),
});
