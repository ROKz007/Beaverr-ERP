import { Router } from "express";
import { documentsController } from "./documents.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const documentsRoutes = Router();

documentsRoutes.use(requireAuth, injectSocietyId);
documentsRoutes.get("/", documentsController.list);

export const adminDocumentsRoutes = Router();

adminDocumentsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminDocumentsRoutes.post("/", documentsController.create);
adminDocumentsRoutes.delete("/:id", documentsController.remove);
