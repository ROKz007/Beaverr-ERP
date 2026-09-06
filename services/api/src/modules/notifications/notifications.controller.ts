import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { listNotificationsSchema, updatePreferencesSchema } from "./notifications.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const filter = listNotificationsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { notifications, total } = await notificationsService.list(req.user!.userId, filter, pagination);
    res.json({ success: true, data: notifications, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async markRead(req: Request, res: Response) {
    const data = await notificationsService.markRead(req.user!.userId, param(req, "id"));
    res.json({ success: true, data });
  },

  async markAllRead(req: Request, res: Response) {
    await notificationsService.markAllRead(req.user!.userId);
    res.json({ success: true, data: { message: "All notifications marked as read." } });
  },

  async remove(req: Request, res: Response) {
    await notificationsService.remove(req.user!.userId, param(req, "id"));
    res.json({ success: true, data: { message: "Notification removed." } });
  },

  async getPreferences(req: Request, res: Response) {
    const data = await notificationsService.getPreference(req.user!.userId);
    res.json({ success: true, data });
  },

  async updatePreferences(req: Request, res: Response) {
    const body = updatePreferencesSchema.parse(req.body);
    const data = await notificationsService.updatePreference(req.user!.userId, body);
    res.json({ success: true, data });
  },
};
