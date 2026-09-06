import { Router } from "express";
import { workersController } from "./workers.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const workersRoutes = Router();

// Worker profiles are back-office only in MVP — no resident-facing directory.
workersRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN", "DEPT_HEAD"));

workersRoutes.get("/", workersController.list);
workersRoutes.get("/:id", workersController.getById);
workersRoutes.post("/", workersController.create);
workersRoutes.patch("/:id", workersController.update);
workersRoutes.delete("/:id", workersController.remove);
