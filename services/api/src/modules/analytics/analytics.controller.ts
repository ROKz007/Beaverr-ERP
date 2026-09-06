import type { Request, Response } from "express";
import { analyticsService } from "./analytics.service";

export const analyticsController = {
  async dashboard(req: Request, res: Response) {
    const data = await analyticsService.dashboard(req.societyId!);
    res.json({ success: true, data });
  },
};
