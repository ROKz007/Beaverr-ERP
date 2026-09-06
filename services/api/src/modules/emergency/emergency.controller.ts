import type { Request, Response } from "express";
import { emergencyService } from "./emergency.service";
import { sosSchema, broadcastSchema, updateEvacuationUnitSchema } from "./emergency.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const emergencyController = {
  async sos(req: Request, res: Response) {
    const body = sosSchema.parse(req.body);
    const data = await emergencyService.sos(req.societyId!, req.user!.userId, body.message);
    res.status(201).json({ success: true, data });
  },

  async securitySos(req: Request, res: Response) {
    const body = sosSchema.parse(req.body);
    const data = await emergencyService.securitySos(req.societyId!, req.user!.userId, body.message);
    res.status(201).json({ success: true, data });
  },

  async broadcast(req: Request, res: Response) {
    const body = broadcastSchema.parse(req.body);
    const data = await emergencyService.broadcast(req.societyId!, req.user!.userId, body.message);
    res.status(201).json({ success: true, data });
  },

  async startEvacuation(req: Request, res: Response) {
    const body = sosSchema.parse(req.body);
    const data = await emergencyService.startEvacuation(req.societyId!, req.user!.userId, body.message);
    res.status(201).json({ success: true, data });
  },

  async getEvacuationStatus(req: Request, res: Response) {
    const data = await emergencyService.getEvacuationStatus(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async updateEvacuationUnit(req: Request, res: Response) {
    const body = updateEvacuationUnitSchema.parse(req.body);
    const data = await emergencyService.updateEvacuationUnit(req.societyId!, param(req, "id"), body.unitId, body.status);
    res.json({ success: true, data });
  },

  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { events, total } = await emergencyService.list(req.societyId!, pagination);
    res.json({ success: true, data: events, meta: { page: pagination.page, limit: pagination.limit, total } });
  },
};
