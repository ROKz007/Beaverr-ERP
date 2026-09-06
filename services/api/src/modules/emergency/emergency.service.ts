import { emergencyRepository } from "./emergency.repository";
import { notificationsService } from "../notifications/notifications.service";
import { emitSosTriggered, emitEmergencyBroadcast } from "../../realtime/socket";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { EvacuationUnitState } from "@repo/types";

async function notifyMany(societyId: string, userIds: string[], category: string, title: string, body: string) {
  await Promise.all(userIds.map((userId) => notificationsService.create({ societyId, userId, category, title, body })));
}

export const emergencyService = {
  async sos(societyId: string, userId: string, message?: string) {
    const event = await emergencyRepository.createEvent(societyId, "RESIDENT_SOS", userId, message);
    emitSosTriggered(societyId, event);
    const responders = await emergencyRepository.findResponderUserIds(societyId);
    await notifyMany(societyId, responders, "SOS", "Resident SOS triggered", message ?? "A resident has triggered an SOS alert.");
    return event;
  },

  async securitySos(societyId: string, userId: string, message?: string) {
    const event = await emergencyRepository.createEvent(societyId, "GUARD_SOS", userId, message);
    emitSosTriggered(societyId, event);
    const responders = await emergencyRepository.findResponderUserIds(societyId);
    await notifyMany(societyId, responders, "SOS", "Security SOS triggered", message ?? "Security has triggered an SOS alert.");
    return event;
  },

  async broadcast(societyId: string, userId: string, message: string) {
    const event = await emergencyRepository.createEvent(societyId, "BROADCAST", userId, message);
    emitEmergencyBroadcast(societyId, event);
    const everyone = await emergencyRepository.findAllUserIds(societyId);
    await notifyMany(societyId, everyone, "EMERGENCY", "Society emergency broadcast", message);
    return event;
  },

  async startEvacuation(societyId: string, userId: string, message?: string) {
    const event = await emergencyRepository.startEvacuation(societyId, userId, message);
    emitEmergencyBroadcast(societyId, event);
    const everyone = await emergencyRepository.findAllUserIds(societyId);
    await notifyMany(
      societyId,
      everyone,
      "EMERGENCY",
      "Evacuation drill started",
      message ?? "An evacuation has been started. Please follow instructions from security.",
    );
    return event;
  },

  async getEvacuationStatus(societyId: string, eventId: string) {
    const event = await emergencyRepository.findEventById(societyId, eventId);
    if (!event || event.type !== "EVACUATION_START") {
      throw new AppError("NOT_FOUND", "Evacuation drill not found.", 404);
    }
    const rawUnits = await emergencyRepository.findEvacuationUnits(eventId);
    const unitSummaries = await emergencyRepository.findUnitSummaries(
      societyId,
      rawUnits.map((u) => u.unitId),
    );
    const summaryById = new Map(unitSummaries.map((u) => [u.id, u]));
    const units = rawUnits.map((u) => ({ ...u, unit: summaryById.get(u.unitId) }));
    const counts = {
      total: units.length,
      safe: units.filter((u) => u.status === "SAFE").length,
      unaccounted: units.filter((u) => u.status === "UNACCOUNTED").length,
      unknown: units.filter((u) => u.status === "UNKNOWN").length,
    };
    return { event, units, counts };
  },

  async updateEvacuationUnit(societyId: string, eventId: string, unitId: string, status: EvacuationUnitState) {
    const event = await emergencyRepository.findEventById(societyId, eventId);
    if (!event || event.type !== "EVACUATION_START") {
      throw new AppError("NOT_FOUND", "Evacuation drill not found.", 404);
    }
    const unit = await emergencyRepository.findUnitSummaries(societyId, [unitId]);
    if (unit.length === 0) throw new AppError("NOT_FOUND", "Unit not found in this society.", 404);
    return emergencyRepository.updateEvacuationUnit(eventId, unitId, status);
  },

  async list(societyId: string, pagination: Pagination) {
    const [events, total] = await emergencyRepository.list(societyId, pagination);
    return { events, total };
  },
};
