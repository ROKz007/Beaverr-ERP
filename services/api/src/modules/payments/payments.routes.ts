import { Router } from "express";
import { paymentsController } from "./payments.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

// Mounted at the same "/payments" prefix as paymentsRoutes below, but registered first in
// routes/index.ts — signature-verified, not JWT-authenticated, per Razorpay's own webhook model.
export const paymentsWebhookRoutes = Router();
paymentsWebhookRoutes.post("/webhook", paymentsController.webhook);

export const paymentsRoutes = Router();

paymentsRoutes.use(requireAuth, injectSocietyId);
paymentsRoutes.get("/", requireRole("RESIDENT"), paymentsController.listMine);
paymentsRoutes.get("/:id", paymentsController.getById);
paymentsRoutes.post("/:id/initiate", requireRole("RESIDENT"), paymentsController.initiate);

export const adminPaymentsRoutes = Router();

adminPaymentsRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminPaymentsRoutes.get("/", paymentsController.listForAdmin);
adminPaymentsRoutes.post("/", paymentsController.createDue);
adminPaymentsRoutes.get("/summary", paymentsController.summary);
