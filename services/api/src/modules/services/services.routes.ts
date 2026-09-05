import { Router } from "express";
import { servicesController } from "./services.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const servicesRoutes = Router();

servicesRoutes.use(requireAuth, injectSocietyId);

// Catalogue browsing: any authenticated role in the society (residents included).
servicesRoutes.get("/", servicesController.list);
servicesRoutes.get("/:id", servicesController.getById);

// Catalogue management: admins only.
servicesRoutes.post("/", requireRole("SOCIETY_ADMIN", "DEPT_HEAD"), servicesController.create);
servicesRoutes.patch("/:id", requireRole("SOCIETY_ADMIN", "DEPT_HEAD"), servicesController.update);
servicesRoutes.delete("/:id", requireRole("SOCIETY_ADMIN", "DEPT_HEAD"), servicesController.remove);
