import { Router } from "express";
import { societiesController } from "./societies.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const societiesRoutes = Router();

societiesRoutes.get("/validate-code/:code", societiesController.validateCode);

societiesRoutes.use(requireAuth, injectSocietyId);

societiesRoutes.get("/profile", societiesController.getProfile);
societiesRoutes.patch("/profile", requireRole("SOCIETY_ADMIN"), societiesController.updateProfile);
societiesRoutes.patch("/gate-module", requireRole("SOCIETY_ADMIN"), societiesController.setGateModule);
societiesRoutes.get("/departments", societiesController.listDepartments);
societiesRoutes.post("/departments", requireRole("SOCIETY_ADMIN"), societiesController.createDepartment);
societiesRoutes.patch("/departments/:id", requireRole("SOCIETY_ADMIN"), societiesController.updateDepartment);
societiesRoutes.delete("/departments/:id", requireRole("SOCIETY_ADMIN"), societiesController.deleteDepartment);
