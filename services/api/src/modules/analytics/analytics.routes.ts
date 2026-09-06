import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN", "DEPT_HEAD"));
analyticsRoutes.get("/dashboard", analyticsController.dashboard);
