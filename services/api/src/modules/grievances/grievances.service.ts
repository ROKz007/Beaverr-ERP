import { grievancesRepository } from "./grievances.repository";
import { scheduleGrievanceEscalation } from "../../queues/grievance-escalation.queue";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { GrievanceStatus, GrievanceType } from "@repo/types";

const TRANSITIONS: Record<GrievanceStatus, GrievanceStatus[]> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

/** Anonymous complaints hide who raised them from everyone except the raiser themselves. */
function redact<T extends { isAnonymous: boolean; raisedByUserId: string | null }>(grievance: T, viewerId: string): T {
  if (grievance.isAnonymous && grievance.raisedByUserId !== viewerId) {
    return { ...grievance, raisedByUserId: null };
  }
  return grievance;
}

export const grievancesService = {
  async listMine(societyId: string, raisedByUserId: string, pagination: Pagination) {
    const [grievances, total] = await grievancesRepository.list(societyId, { raisedByUserId }, pagination);
    return { grievances, total };
  },

  async listForAdmin(
    societyId: string,
    viewerId: string,
    filter: { status?: GrievanceStatus; type?: GrievanceType },
    pagination: Pagination,
  ) {
    const [raw, total] = await grievancesRepository.list(societyId, filter, pagination);
    return { grievances: raw.map((g) => redact(g, viewerId)), total };
  },

  async getById(societyId: string, id: string, viewerId: string, isAdmin: boolean) {
    const grievance = await grievancesRepository.findById(societyId, id);
    if (!grievance) throw new AppError("NOT_FOUND", "Grievance not found.", 404);
    if (!isAdmin && grievance.raisedByUserId !== viewerId) {
      throw new AppError("FORBIDDEN", "You can only view your own grievances.", 403);
    }
    return isAdmin ? redact(grievance, viewerId) : grievance;
  },

  async create(
    societyId: string,
    raisedByUserId: string,
    data: { type: GrievanceType; description: string; againstUserId?: string; mediaUrls: string[]; isAnonymous: boolean },
  ) {
    const grievance = await grievancesRepository.create(societyId, raisedByUserId, data);
    await scheduleGrievanceEscalation(grievance.id);
    return grievance;
  },

  async assign(societyId: string, id: string, assignedToId: string) {
    const grievance = await grievancesRepository.findById(societyId, id);
    if (!grievance) throw new AppError("NOT_FOUND", "Grievance not found.", 404);
    const status = grievance.status === "OPEN" ? "IN_REVIEW" : grievance.status;
    return grievancesRepository.update(id, { assignedToId, status });
  },

  async updateStatus(societyId: string, id: string, status: GrievanceStatus) {
    const grievance = await grievancesRepository.findById(societyId, id);
    if (!grievance) throw new AppError("NOT_FOUND", "Grievance not found.", 404);
    if (!TRANSITIONS[grievance.status as GrievanceStatus].includes(status)) {
      throw new AppError("INVALID_TRANSITION", `Cannot move grievance from ${grievance.status} to ${status}.`, 400);
    }
    return grievancesRepository.update(id, {
      status,
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    });
  },
};
