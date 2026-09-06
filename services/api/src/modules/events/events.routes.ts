import { Router } from "express";
import { eventsController } from "./events.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const eventsRoutes = Router();

eventsRoutes.use(requireAuth, injectSocietyId);
eventsRoutes.get("/", eventsController.list);
eventsRoutes.get("/:id", eventsController.getById);
eventsRoutes.post("/:id/rsvp", eventsController.rsvp);
eventsRoutes.delete("/:id/rsvp", eventsController.cancelRsvp);

export const adminEventsRoutes = Router();

adminEventsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminEventsRoutes.post("/", eventsController.create);
adminEventsRoutes.patch("/:id", eventsController.update);
adminEventsRoutes.delete("/:id", eventsController.remove);
