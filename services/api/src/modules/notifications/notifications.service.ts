import { notificationsRepository } from "./notifications.repository";
import { sendEmail } from "../../utils/mailer";
import { emitNotification } from "../../realtime/socket";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

export const notificationsService = {
  async list(userId: string, filter: { isRead?: boolean; category?: string }, pagination: Pagination) {
    const [notifications, total] = await notificationsRepository.list(userId, filter, pagination);
    return { notifications, total };
  },

  async markRead(userId: string, id: string) {
    const notification = await notificationsRepository.findById(userId, id);
    if (!notification) throw new AppError("NOT_FOUND", "Notification not found.", 404);
    return notificationsRepository.markRead(id);
  },

  markAllRead(userId: string) {
    return notificationsRepository.markAllRead(userId);
  },

  async remove(userId: string, id: string) {
    const notification = await notificationsRepository.findById(userId, id);
    if (!notification) throw new AppError("NOT_FOUND", "Notification not found.", 404);
    return notificationsRepository.remove(id);
  },

  async getPreference(userId: string) {
    return (await notificationsRepository.getPreference(userId)) ?? { userId, email: true, inApp: true };
  },

  updatePreference(userId: string, data: { email?: boolean; inApp?: boolean }) {
    return notificationsRepository.upsertPreference(userId, data);
  },

  /** Shared entry point other modules use to raise a notification — in-app row + live socket push + optional email. */
  async create(input: { societyId: string; userId: string; category: string; title: string; body: string }) {
    const notification = await notificationsRepository.create(input);
    emitNotification(input.userId, notification);

    const preference = await notificationsService.getPreference(input.userId);
    if (preference.email) {
      const user = await notificationsRepository.findUserById(input.userId);
      if (user?.email) {
        await sendEmail(user.email, input.title, input.body);
      }
    }
    return notification;
  },
};
