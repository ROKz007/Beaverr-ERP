import { Router } from "express";
import { announcementsController } from "./announcements.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const announcementsRoutes = Router();

announcementsRoutes.use(requireAuth, injectSocietyId);
announcementsRoutes.get("/", announcementsController.list);
announcementsRoutes.get("/:id", announcementsController.getById);
announcementsRoutes.post("/:id/read-receipt", announcementsController.markRead);

export const adminAnnouncementsRoutes = Router();

adminAnnouncementsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminAnnouncementsRoutes.post("/", announcementsController.create);
adminAnnouncementsRoutes.patch("/:id", announcementsController.update);
adminAnnouncementsRoutes.delete("/:id", announcementsController.remove);
adminAnnouncementsRoutes.get("/:id/read-receipts", announcementsController.readReceiptCount);
