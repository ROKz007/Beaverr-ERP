import { announcementsRepository } from "./announcements.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

export const announcementsService = {
  async list(societyId: string, userId: string, pagination: Pagination) {
    const [rawAnnouncements, total] = await announcementsRepository.list(societyId, pagination);
    const announcements = await Promise.all(
      rawAnnouncements.map(async (a) => {
        const receipt = await announcementsRepository.findMyReceipt(a.id, userId);
        return { ...a, isRead: Boolean(receipt) };
      }),
    );
    return { announcements, total };
  },

  async getById(societyId: string, id: string, userId: string) {
    const announcement = await announcementsRepository.findById(societyId, id);
    if (!announcement) throw new AppError("NOT_FOUND", "Announcement not found.", 404);
    const receipt = await announcementsRepository.findMyReceipt(id, userId);
    return { ...announcement, isRead: Boolean(receipt) };
  },

  create: announcementsRepository.create,

  async update(societyId: string, id: string, data: Parameters<typeof announcementsRepository.update>[1]) {
    await announcementsService.assertExists(societyId, id);
    return announcementsRepository.update(id, data);
  },

  async softDelete(societyId: string, id: string) {
    await announcementsService.assertExists(societyId, id);
    return announcementsRepository.softDelete(id);
  },

  async assertExists(societyId: string, id: string) {
    const announcement = await announcementsRepository.findById(societyId, id);
    if (!announcement) throw new AppError("NOT_FOUND", "Announcement not found.", 404);
    return announcement;
  },

  async markRead(societyId: string, id: string, userId: string) {
    await announcementsService.assertExists(societyId, id);
    return announcementsRepository.markRead(id, userId);
  },

  async readReceiptCount(societyId: string, id: string) {
    await announcementsService.assertExists(societyId, id);
    return announcementsRepository.countReceipts(id);
  },
};
