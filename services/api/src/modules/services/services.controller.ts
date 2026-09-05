import type { Request, Response } from "express";
import { servicesService } from "./services.service";
import { listServicesSchema, createServiceSchema, updateServiceSchema } from "./services.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const servicesController = {
  async list(req: Request, res: Response) {
    const filter = listServicesSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { services, total } = await servicesService.list(req.societyId!, filter, pagination);
    res.json({ success: true, data: services, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const data = await servicesService.getById(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const body = createServiceSchema.parse(req.body);
    const data = await servicesService.create(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const body = updateServiceSchema.parse(req.body);
    const data = await servicesService.update(param(req, "id"), body);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await servicesService.softDelete(param(req, "id"));
    res.json({ success: true, data: { message: "Service removed." } });
  },
};
