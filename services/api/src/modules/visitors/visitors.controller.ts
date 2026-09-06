import type { Request, Response } from "express";
import { visitorsService } from "./visitors.service";
import { listVisitorsSchema, preApproveVisitorSchema, walkinVisitorSchema, blacklistVisitorSchema } from "./visitors.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";

export const visitorsController = {
  async listMine(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { visitors, total } = await visitorsService.listMine(req.societyId!, req.user!.userId, pagination);
    res.json({ success: true, data: visitors, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async preApprove(req: Request, res: Response) {
    const body = preApproveVisitorSchema.parse(req.body);
    const data = await visitorsService.preApprove(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async walkin(req: Request, res: Response) {
    const body = walkinVisitorSchema.parse(req.body);
    const data = await visitorsService.walkin(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async scan(req: Request, res: Response) {
    const data = await visitorsService.scanQr(req.societyId!, param(req, "qrToken"));
    res.json({ success: true, data });
  },

  async approve(req: Request, res: Response) {
    const data = await visitorsService.approve(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data });
  },

  async deny(req: Request, res: Response) {
    const data = await visitorsService.deny(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data });
  },

  async exit(req: Request, res: Response) {
    const data = await visitorsService.exit(req.societyId!, param(req, "id"));
    res.json({ success: true, data });
  },

  async listForAdmin(req: Request, res: Response) {
    const filter = listVisitorsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { visitors, total } = await visitorsService.listForAdmin(req.societyId!, filter, pagination);
    res.json({ success: true, data: visitors, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async listBlacklist(req: Request, res: Response) {
    const pagination = parsePagination(req.query);
    const { visitors, total } = await visitorsService.listBlacklist(req.societyId!, pagination);
    res.json({ success: true, data: visitors, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async setBlacklist(req: Request, res: Response) {
    const body = blacklistVisitorSchema.parse(req.body);
    const data = await visitorsService.setBlacklist(req.societyId!, param(req, "id"), body.isBlacklisted);
    res.json({ success: true, data });
  },
};
