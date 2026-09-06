import { randomUUID } from "node:crypto";
import { visitorsRepository } from "./visitors.repository";
import { notificationsService } from "../notifications/notifications.service";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { VisitorStatus } from "@repo/types";

async function assertNotBlacklisted(societyId: string, phone?: string) {
  if (!phone) return;
  const blacklisted = await visitorsRepository.isPhoneBlacklisted(societyId, phone);
  if (blacklisted) {
    throw new AppError("BLACKLISTED_VISITOR", "This visitor is blacklisted and cannot be admitted.", 403);
  }
}

export const visitorsService = {
  async listMine(societyId: string, residentId: string, pagination: Pagination) {
    const [visitors, total] = await visitorsRepository.list(societyId, { residentId }, pagination);
    return { visitors, total };
  },

  async listForAdmin(societyId: string, filter: { status?: VisitorStatus }, pagination: Pagination) {
    const [visitors, total] = await visitorsRepository.list(societyId, filter, pagination);
    return { visitors, total };
  },

  async listBlacklist(societyId: string, pagination: Pagination) {
    const [visitors, total] = await visitorsRepository.list(societyId, { isBlacklisted: true }, pagination);
    return { visitors, total };
  },

  async getById(societyId: string, id: string) {
    const visitor = await visitorsRepository.findById(societyId, id);
    if (!visitor) throw new AppError("NOT_FOUND", "Visitor not found.", 404);
    return visitor;
  },

  async preApprove(societyId: string, residentId: string, data: { visitorName: string; visitorPhone?: string }) {
    await assertNotBlacklisted(societyId, data.visitorPhone);
    return visitorsRepository.create({
      societyId,
      residentId,
      ...data,
      qrToken: randomUUID(),
      status: "APPROVED",
    });
  },

  async walkin(
    societyId: string,
    data: { residentId: string; visitorName: string; visitorPhone?: string; photoUrl?: string },
  ) {
    await assertNotBlacklisted(societyId, data.visitorPhone);
    const visitor = await visitorsRepository.create({ societyId, ...data, status: "PENDING" });
    await notificationsService.create({
      societyId,
      userId: data.residentId,
      category: "VISITOR_APPROVAL",
      title: "Visitor waiting at the gate",
      body: `${data.visitorName} is waiting at the gate and needs your approval.`,
    });
    return visitor;
  },

  async scanQr(societyId: string, qrToken: string) {
    const visitor = await visitorsRepository.findByQrToken(societyId, qrToken);
    if (!visitor) throw new AppError("NOT_FOUND", "QR code not recognised.", 404);
    if (visitor.isBlacklisted) {
      throw new AppError("BLACKLISTED_VISITOR", "This visitor is blacklisted and cannot be admitted.", 403);
    }
    const updated = await visitorsRepository.update(visitor.id, { status: "INSIDE", entryAt: new Date() });
    await notificationsService.create({
      societyId,
      userId: visitor.residentId,
      category: "VISITOR_ENTRY",
      title: "Visitor entered",
      body: `${visitor.visitorName} has entered the society.`,
    });
    return updated;
  },

  async approve(societyId: string, id: string, residentId: string) {
    const visitor = await visitorsService.getById(societyId, id);
    if (visitor.residentId !== residentId) {
      throw new AppError("FORBIDDEN", "You can only approve your own visitors.", 403);
    }
    if (visitor.isBlacklisted) {
      throw new AppError("BLACKLISTED_VISITOR", "This visitor is blacklisted and cannot be admitted.", 403);
    }
    return visitorsRepository.update(id, { status: "INSIDE", entryAt: new Date() });
  },

  async deny(societyId: string, id: string, residentId: string) {
    const visitor = await visitorsService.getById(societyId, id);
    if (visitor.residentId !== residentId) {
      throw new AppError("FORBIDDEN", "You can only deny your own visitors.", 403);
    }
    return visitorsRepository.update(id, { status: "DENIED" });
  },

  async exit(societyId: string, id: string) {
    await visitorsService.getById(societyId, id);
    return visitorsRepository.update(id, { status: "EXITED", exitAt: new Date() });
  },

  async setBlacklist(societyId: string, id: string, isBlacklisted: boolean) {
    await visitorsService.getById(societyId, id);
    return visitorsRepository.update(id, { isBlacklisted });
  },
};
