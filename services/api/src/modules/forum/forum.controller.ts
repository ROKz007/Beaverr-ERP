import type { Request, Response } from "express";
import { forumService } from "./forum.service";
import { listThreadsSchema, createThreadSchema, createReplySchema, flagThreadSchema } from "./forum.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const forumController = {
  async list(req: Request, res: Response) {
    const filter = listThreadsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { threads, total } = await forumService.list(req.societyId!, filter, pagination);
    res.json({ success: true, data: threads, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async listForAdmin(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { threads, total } = await forumService.listForAdmin(req.societyId!, pagination);
    res.json({ success: true, data: threads, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await forumService.getById(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async createThread(req: Request, res: Response) {
    const body = createThreadSchema.parse(req.body);
    const data = await forumService.createThread(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async reply(req: Request, res: Response) {
    const body = createReplySchema.parse(req.body);
    const data = await forumService.reply(req.societyId!, param(req, "id"), req.user!.userId, body.body);
    res.status(201).json({ success: true, data });
  },

  async setFlag(req: Request, res: Response) {
    const body = flagThreadSchema.parse(req.body);
    const data = await forumService.setFlag(req.societyId!, param(req, "id"), body.isFlagged);
    res.json({ success: true, data });
  },

  async removeThread(req: Request, res: Response) {
    await forumService.removeThread(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Thread removed." } });
  },

  async removeReply(req: Request, res: Response) {
    await forumService.removeReply(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Reply removed." } });
  },
};
