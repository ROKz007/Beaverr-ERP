import { Router } from "express";
import { grievancesController } from "./grievances.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const grievancesRoutes = Router();

grievancesRoutes.use(requireAuth, injectSocietyId);
grievancesRoutes.get("/", grievancesController.listMine);
grievancesRoutes.get("/:id", grievancesController.getById);
grievancesRoutes.post("/", grievancesController.create);

export const adminGrievancesRoutes = Router();

adminGrievancesRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN", "DEPT_HEAD"));
adminGrievancesRoutes.get("/", grievancesController.listForAdmin);
adminGrievancesRoutes.get("/:id", grievancesController.getById);
adminGrievancesRoutes.patch("/:id/assign", grievancesController.assign);
adminGrievancesRoutes.patch("/:id/status", grievancesController.updateStatus);
