import type { Request, Response } from "express";
import { grievancesService } from "./grievances.service";
import {
  listGrievancesSchema,
  createGrievanceSchema,
  assignGrievanceSchema,
  updateGrievanceStatusSchema,
} from "./grievances.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD"]);

export const grievancesController = {
  async listMine(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { grievances, total } = await grievancesService.listMine(req.societyId!, req.user!.userId, pagination);
    res.json({ success: true, data: grievances, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async listForAdmin(req: Request, res: Response) {
    const filter = listGrievancesSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { grievances, total } = await grievancesService.listForAdmin(req.societyId!, req.user!.userId, filter, pagination);
    res.json({ success: true, data: grievances, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const isAdmin = ADMIN_ROLES.has(req.user!.role);
    const data = await grievancesService.getById(req.societyId!, param(req, "id"), req.user!.userId, isAdmin);
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const body = createGrievanceSchema.parse(req.body);
    const data = await grievancesService.create(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async assign(req: Request, res: Response) {
    const body = assignGrievanceSchema.parse(req.body);
    const data = await grievancesService.assign(req.societyId!, param(req, "id"), body.assignedToId);
    res.json({ success: true, data });
  },

  async updateStatus(req: Request, res: Response) {
    const body = updateGrievanceStatusSchema.parse(req.body);
    const data = await grievancesService.updateStatus(req.societyId!, param(req, "id"), body.status);
    res.json({ success: true, data });
  },
};
