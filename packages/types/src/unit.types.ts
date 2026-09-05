// Prisma enum values can't start with a digit, hence ONE_BHK rather than 1BHK.
export type UnitType = "ONE_BHK" | "TWO_BHK" | "THREE_BHK" | "VILLA";

export interface Unit {
  id: string;
  societyId: string;
  block: string | null;
  floor: number | null;
  unitNumber: string;
  type: UnitType;
  ownerUserId: string | null;
  tenantUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
