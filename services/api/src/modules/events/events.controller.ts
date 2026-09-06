import type { Request, Response } from "express";
import { eventsService } from "./events.service";
import { createEventSchema, updateEventSchema, rsvpSchema } from "./events.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const eventsController = {
  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { events, total } = await eventsService.list(req.societyId!, req.user!.userId, pagination);
    res.json({ success: true, data: events, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await eventsService.getById(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const body = createEventSchema.parse(req.body);
    const data = await eventsService.create(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateEventSchema.parse(req.body);
    const data = await eventsService.update(req.societyId!, param(req, "id"), body);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await eventsService.softDelete(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Event removed." } });
  },

  async rsvp(req: Request, res: Response) {
    const body = rsvpSchema.parse(req.body);
    const data = await eventsService.rsvp(req.societyId!, param(req, "id"), req.user!.userId, body.headcount);
    res.json({ success: true, data });
  },

  async cancelRsvp(req: Request, res: Response) {
    await eventsService.cancelRsvp(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data: { message: "RSVP cancelled." } });
  },
};
