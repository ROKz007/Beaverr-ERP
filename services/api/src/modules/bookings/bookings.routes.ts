import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const bookingsRoutes = Router();

bookingsRoutes.use(requireAuth, injectSocietyId);

// Residents see only their own bookings (enforced in the controller); admins see the whole society.
bookingsRoutes.get("/", bookingsController.list);
bookingsRoutes.get("/:id", bookingsController.getById);
bookingsRoutes.post("/", bookingsController.create);
bookingsRoutes.patch("/:id/reschedule", bookingsController.reschedule);
bookingsRoutes.post("/:id/cancel", bookingsController.cancel);
bookingsRoutes.post("/:id/rate", bookingsController.rate);

// Admin/dept-head only: manual assignment and forced status transitions (worker has no login in MVP).
bookingsRoutes.post("/:id/assign", requireRole("SOCIETY_ADMIN", "DEPT_HEAD"), bookingsController.assignWorker);
bookingsRoutes.patch("/:id/status", requireRole("SOCIETY_ADMIN", "DEPT_HEAD"), bookingsController.updateStatus);
