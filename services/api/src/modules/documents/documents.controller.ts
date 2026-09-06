import type { Request, Response } from "express";
import { documentsService } from "./documents.service";
import { createDocumentSchema } from "./documents.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const documentsController = {
  async list(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { documents, total } = await documentsService.list(req.societyId!, pagination);
    res.json({ success: true, data: documents, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async create(req: Request, res: Response) {
    const body = createDocumentSchema.parse(req.body);
    const data = await documentsService.create(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await documentsService.remove(req.societyId!, param(req, "id"));
    res.json({ success: true, data: { message: "Document removed." } });
  },
};
