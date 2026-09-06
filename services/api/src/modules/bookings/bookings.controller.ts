import type { Request, Response } from "express";
import { bookingsService } from "./bookings.service";
import {
  listBookingsSchema,
  createBookingSchema,
  updateStatusSchema,
  assignWorkerSchema,
  rateBookingSchema,
} from "./bookings.validator";
import { parsePagination } from "../../utils/pagination";
import { param } from "../../utils/params";
import { AppError } from "../../utils/AppError";

const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD"]);

export const bookingsController = {
  async list(req: Request, res: Response) {
    const query = listBookingsSchema.parse(req.query);
    const pagination = parsePagination(req.query);
    const isAdmin = ADMIN_ROLES.has(req.user!.role);
    const filter = { ...query, residentId: isAdmin ? undefined : req.user!.userId };
    const { bookings, total } = await bookingsService.list(req.societyId!, filter, pagination);
    res.json({ success: true, data: bookings, meta: { page: pagination.page, limit: pagination.limit, total } });
  },

  async getById(req: Request, res: Response) {
    const booking = await bookingsService.getById(req.societyId!, param(req, "id"));
    const isAdmin = ADMIN_ROLES.has(req.user!.role);
    if (!isAdmin && booking.residentId !== req.user!.userId) {
      throw new AppError("FORBIDDEN", "Not your booking.", 403);
    }
    res.json({ success: true, data: booking });
  },

  async create(req: Request, res: Response) {
    const body = createBookingSchema.parse(req.body);
    const data = await bookingsService.create(req.societyId!, req.user!.userId, body);
    res.status(201).json({ success: true, data });
  },

  async assignWorker(req: Request, res: Response) {
    const body = assignWorkerSchema.parse(req.body);
    const data = await bookingsService.assignWorker(req.societyId!, param(req, "id"), body.workerId);
    res.json({ success: true, data });
  },

  async updateStatus(req: Request, res: Response) {
    const body = updateStatusSchema.parse(req.body);
    const data = await bookingsService.updateStatus(req.societyId!, param(req, "id"), body.status, body.scheduledAt);
    res.json({ success: true, data });
  },

  async cancel(req: Request, res: Response) {
    const isAdmin = ADMIN_ROLES.has(req.user!.role);
    const data = await bookingsService.cancel(req.societyId!, param(req, "id"), req.user!.userId, isAdmin);
    res.json({ success: true, data });
  },

  async rate(req: Request, res: Response) {
    const body = rateBookingSchema.parse(req.body);
    const data = await bookingsService.rate(req.societyId!, param(req, "id"), req.user!.userId, body.rating, body.ratingNote);
    res.json({ success: true, data });
  },
};
