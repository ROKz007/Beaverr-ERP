export type EmergencyEventType = "RESIDENT_SOS" | "GUARD_SOS" | "BROADCAST" | "EVACUATION_START";
export type EvacuationUnitState = "UNKNOWN" | "SAFE" | "UNACCOUNTED";

export interface EmergencyEvent {
  id: string;
  societyId: string;
  type: EmergencyEventType;
  triggeredByUserId: string;
  message: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface EvacuationUnitStatus {
  id: string;
  eventId: string;
  unitId: string;
  status: EvacuationUnitState;
  updatedAt: string;
  unit?: { id: string; block: string | null; unitNumber: string };
}

export interface EvacuationSummary {
  event: EmergencyEvent;
  units: EvacuationUnitStatus[];
  counts: { total: number; safe: number; unaccounted: number; unknown: number };
}
