import { z } from "zod";

export const grievanceTypeSchema = z.enum(["WORKER", "NEIGHBOUR", "MANAGEMENT", "INFRASTRUCTURE"]);
export const grievanceStatusSchema = z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"]);

export const listGrievancesSchema = z.object({
  status: grievanceStatusSchema.optional(),
  type: grievanceTypeSchema.optional(),
});

export const createGrievanceSchema = z.object({
  type: grievanceTypeSchema,
  description: z.string().min(1).max(2000),
  againstUserId: z.string().optional(),
  mediaUrls: z.array(z.string().url()).max(5).default([]),
  isAnonymous: z.boolean().default(false),
});

export const assignGrievanceSchema = z.object({
  assignedToId: z.string().min(1),
});

export const updateGrievanceStatusSchema = z.object({
  status: grievanceStatusSchema,
});
