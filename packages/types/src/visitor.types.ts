export type VisitorStatus = "PENDING" | "APPROVED" | "DENIED" | "INSIDE" | "EXITED";

export interface Visitor {
  id: string;
  societyId: string;
  residentId: string;
  visitorName: string;
  visitorPhone: string | null;
  photoUrl: string | null;
  entryAt: string | null;
  exitAt: string | null;
  qrToken: string | null;
  status: VisitorStatus;
  isBlacklisted: boolean;
  createdAt: string;
  updatedAt: string;
}
