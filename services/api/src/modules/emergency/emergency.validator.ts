import { z } from "zod";

export const sosSchema = z.object({
  message: z.string().max(300).optional(),
});

export const broadcastSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const evacuationUnitStateSchema = z.enum(["UNKNOWN", "SAFE", "UNACCOUNTED"]);

export const updateEvacuationUnitSchema = z.object({
  unitId: z.string().min(1),
  status: evacuationUnitStateSchema,
});
