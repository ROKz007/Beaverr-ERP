import { Router } from "express";
import { unitsController } from "./units.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const unitsRoutes = Router();

unitsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));

unitsRoutes.get("/", unitsController.list);
unitsRoutes.post("/", unitsController.create);
unitsRoutes.patch("/:id", unitsController.update);
unitsRoutes.post("/:id/transfer", unitsController.transfer);
