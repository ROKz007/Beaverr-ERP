import { Router } from "express";
import multer from "multer";
import { residentsController } from "./residents.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

export const residentsRoutes = Router();

residentsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN", "DEPT_HEAD"));

residentsRoutes.get("/", residentsController.list);
residentsRoutes.post("/", requireRole("SOCIETY_ADMIN"), residentsController.create);
residentsRoutes.post("/bulk", requireRole("SOCIETY_ADMIN"), upload.single("file"), residentsController.bulkImport);
residentsRoutes.get("/:id", residentsController.getById);
residentsRoutes.patch("/:id", requireRole("SOCIETY_ADMIN"), residentsController.update);
residentsRoutes.patch("/:id/suspend", requireRole("SOCIETY_ADMIN"), residentsController.suspend);
residentsRoutes.delete("/:id", requireRole("SOCIETY_ADMIN"), residentsController.remove);
