import type { Request, Response } from "express";
import { announcementsService } from "./announcements.service";
import { createAnnouncementSchema, updateAnnouncementSchema } from "./announcements.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const announcementsController = {
  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { announcements, total } = await announcementsService.list(req.societyId!, req.user!.userId, pagination);
    res.json({ success: true, data: announcements, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await announcementsService.getById(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data });
  },

  async markRead(req: Request, res: Response) {
    await announcementsService.markRead(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data: { message: "Marked as read." } });
  },

  async create(req: Request, res: Response) {
    const body = createAnnouncementSchema.parse(req.body);
    const data = await announcementsService.create(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateAnnouncementSchema.parse(req.body);
    const data = await announcementsService.update(req.societyId!, param(req, "id"), body);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await announcementsService.softDelete(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Announcement removed." } });
  },

  async readReceiptCount(req: Request, res: Response) {
    const count = await announcementsService.readReceiptCount(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { count } });
  },
};
