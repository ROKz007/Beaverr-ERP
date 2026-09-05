import { z } from "zod";

const unitType = z.enum(["ONE_BHK", "TWO_BHK", "THREE_BHK", "VILLA"]);

export const createUnitSchema = z.object({
  block: z.string().max(20).optional(),
  floor: z.coerce.number().int().optional(),
  unitNumber: z.string().min(1).max(20),
  type: unitType,
});

export const updateUnitSchema = createUnitSchema.partial();

export const transferUnitSchema = z.object({
  ownerUserId: z.string().optional(),
  tenantUserId: z.string().optional(),
});
