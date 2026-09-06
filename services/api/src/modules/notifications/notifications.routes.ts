import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const notificationsRoutes = Router();

notificationsRoutes.use(requireAuth);

notificationsRoutes.get("/", notificationsController.list);
notificationsRoutes.patch("/read-all", notificationsController.markAllRead);
notificationsRoutes.patch("/:id/read", notificationsController.markRead);
notificationsRoutes.delete("/:id", notificationsController.remove);
notificationsRoutes.get("/preferences", notificationsController.getPreferences);
notificationsRoutes.patch("/preferences", notificationsController.updatePreferences);
