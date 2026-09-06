import { Router } from "express";
import { emergencyController } from "./emergency.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const emergencyRoutes = Router();

emergencyRoutes.use(requireAuth, injectSocietyId);
emergencyRoutes.post("/sos", requireRole("RESIDENT"), emergencyController.sos);
emergencyRoutes.post("/security-sos", requireRole("GUARD"), emergencyController.securitySos);

export const adminEmergencyRoutes = Router();

adminEmergencyRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminEmergencyRoutes.post("/broadcast", emergencyController.broadcast);
adminEmergencyRoutes.post("/evacuation", emergencyController.startEvacuation);
adminEmergencyRoutes.get("/evacuation/:id", emergencyController.getEvacuationStatus);
adminEmergencyRoutes.patch("/evacuation/:id/units", emergencyController.updateEvacuationUnit);
adminEmergencyRoutes.get("/log", emergencyController.list);
