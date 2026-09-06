import type { Request, Response } from "express";
import { paymentsService } from "./payments.service";
import { listPaymentsSchema, createDueSchema } from "./payments.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";
import { env } from "../../config/env";

const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD"]);

export const paymentsController = {
  async listMine(req: Request, res: Response) {
    const filter = listPaymentsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { payments, total } = await paymentsService.listMine(req.societyId!, req.user!.userId, filter, pagination);
    res.json({ success: true, data: payments, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const isAdmin = ADMIN_ROLES.has(req.user!.role);
    const data = await paymentsService.getById(req.societyId!, param(req, "id"), req.user!.userId, isAdmin);
    res.json({ success: true, data });
  },

  async initiate(req: Request, res: Response) {
    const data = await paymentsService.initiate(req.societyId!, param(req, "id"), req.user!.userId);
    res.json({ success: true, data: { ...data, keyId: env.RAZORPAY_KEY_ID } });
  },

  async webhook(req: Request, res: Response) {
    await paymentsService.handleWebhook(req.rawBody!, req.headers["x-razorpay-signature"] as string | undefined);
    res.json({ success: true, data: { received: true } });
  },

  async listForAdmin(req: Request, res: Response) {
    const filter = listPaymentsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const { payments, total } = await paymentsService.listForAdmin(req.societyId!, filter, pagination);
    res.json({ success: true, data: payments, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async createDue(req: Request, res: Response) {
    const body = createDueSchema.parse(req.body);
    const data = await paymentsService.createDue(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async summary(req: Request, res: Response) {
    const data = await paymentsService.summary(req.societyId!);
    res.json({ success: true, data });
  },
};
