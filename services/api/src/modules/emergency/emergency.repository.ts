import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { EmergencyEventType, EvacuationUnitState } from "@repo/types";

export const emergencyRepository = {
  createEvent(societyId: string, type: EmergencyEventType, triggeredByUserId: string, message?: string) {
    return prisma.emergencyEvent.create({ data: { societyId, type, triggeredByUserId, message } });
  },

  findEventById(societyId: string, id: string) {
    return prisma.emergencyEvent.findFirst({ where: { id, societyId } });
  },

  list(societyId: string, pagination: Pagination) {
    const where = { societyId };
    return prisma.$transaction([
      prisma.emergencyEvent.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.emergencyEvent.count({ where }),
    ]);
  },

  // Guards + admins — who a resident/guard SOS actually needs to reach.
  findResponderUserIds(societyId: string) {
    return prisma.user
      .findMany({
        where: { societyId, deletedAt: null, role: { in: ["GUARD", "SOCIETY_ADMIN", "DEPT_HEAD"] } },
        select: { id: true },
      })
      .then((rows) => rows.map((r) => r.id));
  },

  // Everyone — for a society-wide broadcast. Fine at MVP scale (a society's user count), would need
  // a bulk-notify path instead of a fan-out loop if this ever needs to scale to thousands of users.
  findAllUserIds(societyId: string) {
    return prisma.user.findMany({ where: { societyId, deletedAt: null }, select: { id: true } }).then((rows) => rows.map((r) => r.id));
  },

  async startEvacuation(societyId: string, triggeredByUserId: string, message: string | undefined) {
    const units = await prisma.unit.findMany({ where: { societyId, deletedAt: null }, select: { id: true } });
    return prisma.$transaction(async (tx) => {
      const event = await tx.emergencyEvent.create({
        data: { societyId, type: "EVACUATION_START", triggeredByUserId, message },
      });
      if (units.length > 0) {
        await tx.evacuationUnitStatus.createMany({
          data: units.map((u) => ({ eventId: event.id, unitId: u.id })),
        });
      }
      return event;
    });
  },

  findEvacuationUnits(eventId: string) {
    return prisma.evacuationUnitStatus.findMany({ where: { eventId } });
  },

  updateEvacuationUnit(eventId: string, unitId: string, status: EvacuationUnitState) {
    return prisma.evacuationUnitStatus.update({ where: { eventId_unitId: { eventId, unitId } }, data: { status } });
  },

  findUnitSummaries(societyId: string, unitIds: string[]) {
    return prisma.unit.findMany({
      where: { id: { in: unitIds }, societyId },
      select: { id: true, block: true, unitNumber: true },
    });
  },
};
