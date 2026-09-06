import type { Request, Response } from "express";
import { workersService } from "./workers.service";
import { listWorkersSchema, createWorkerSchema, updateWorkerSchema } from "./workers.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const workersController = {
  async list(req: Request, res: Response) {
    const filter = listWorkersSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { workers, total } = await workersService.list(req.societyId!, filter, pagination);
    res.json({ success: true, data: workers, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await workersService.getById(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const body = createWorkerSchema.parse(req.body);
    const data = await workersService.create(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateWorkerSchema.parse(req.body);
    const data = await workersService.update(req.societyId!, param(req, "id"), body);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await workersService.softDelete(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Worker removed." } });
  },
};
