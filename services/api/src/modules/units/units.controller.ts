import type { Request, Response } from "express";
import { unitsService } from "./units.service";
import { createUnitSchema, updateUnitSchema, transferUnitSchema } from "./units.validator";
import { param } from "../../utils/params";
import { parsePagination } from "../../utils/pagination";

export const unitsController = {
  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { units, total } = await unitsService.list(req.societyId!, pagination);
    res.json({ success: true, data: units, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async create(req: Request, res: Response) {
    const body = createUnitSchema.parse(req.body);
    const data = await unitsService.create(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateUnitSchema.parse(req.body);
    const data = await unitsService.update(param(req, "id"), body);
    res.json({ success: true, data });
  },

  async transfer(req: Request, res: Response) {
    const body = transferUnitSchema.parse(req.body);
    const data = await unitsService.transfer(param(req, "id"), body);
    res.json({ success: true, data });
  },
};
