import type { Request, Response } from "express";
import { residentsService } from "./residents.service";
import { createResidentSchema, updateResidentSchema, suspendResidentSchema } from "./residents.validator";
import { parsePagination } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";
import { param } from "../../utils/params";

export const residentsController = {
  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { residents, total } = await residentsService.list(req.societyId!, pagination);
    res.json({ success: true, data: residents, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await residentsService.getById(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const body = createResidentSchema.parse(req.body);
    const data = await residentsService.create(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateResidentSchema.parse(req.body);
    const data = await residentsService.update(param(req, "id"), body);
    res.json({ success: true, data });
  },

  async suspend(req: Request, res: Response) {
    const { isActive } = suspendResidentSchema.parse(req.body);
    const data = await residentsService.suspend(param(req, "id"), isActive);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await residentsService.softDelete(param(req, "id"));
    res.json({ success: true, data: { message: "Resident removed." } });
  },

  async bulkImport(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError("VALIDATION_ERROR", "CSV file is required (multipart field name: file).", 400);
    }
    const data = await residentsService.bulkImport(req.societyId!, req.file.buffer);
    res.json({ success: true, data });
  },
};
