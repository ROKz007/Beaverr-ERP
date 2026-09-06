export type GrievanceType = "WORKER" | "NEIGHBOUR" | "MANAGEMENT" | "INFRASTRUCTURE";
export type GrievanceStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";

export interface Grievance {
  id: string;
  societyId: string;
  raisedByUserId: string | null;
  type: GrievanceType;
  againstUserId: string | null;
  description: string;
  mediaUrls: string[];
  status: GrievanceStatus;
  assignedToId: string | null;
  isAnonymous: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
