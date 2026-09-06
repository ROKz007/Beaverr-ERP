import { Router } from "express";
import { visitorsController } from "./visitors.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const visitorsRoutes = Router();

visitorsRoutes.use(requireAuth, injectSocietyId);
visitorsRoutes.get("/", requireRole("RESIDENT"), visitorsController.listMine);
visitorsRoutes.post("/pre-approve", requireRole("RESIDENT"), visitorsController.preApprove);

// "Gate Console" — no separate guard-app in MVP, these are called from a GUARD-role page in admin-web.
export const gateRoutes = Router();

gateRoutes.use(requireAuth, injectSocietyId);
gateRoutes.post("/walkin", requireRole("GUARD"), visitorsController.walkin);
gateRoutes.get("/scan/:qrToken", requireRole("GUARD"), visitorsController.scan);
gateRoutes.patch("/visitors/:id/approve", requireRole("RESIDENT"), visitorsController.approve);
gateRoutes.patch("/visitors/:id/deny", requireRole("RESIDENT"), visitorsController.deny);
gateRoutes.patch("/visitors/:id/exit", requireRole("GUARD"), visitorsController.exit);

export const adminVisitorsRoutes = Router();

adminVisitorsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN", "GUARD"));
adminVisitorsRoutes.get("/", visitorsController.listForAdmin);
adminVisitorsRoutes.get("/blacklist", visitorsController.listBlacklist);
adminVisitorsRoutes.patch("/:id/blacklist", requireRole("SOCIETY_ADMIN"), visitorsController.setBlacklist);
