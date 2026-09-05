import { Router } from "express";
import { authController } from "./auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/send-otp", authController.sendOtp);
authRoutes.post("/verify-otp", authController.verifyOtp);
authRoutes.post("/guard-login", authController.guardLogin);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", requireAuth, authController.logout);
authRoutes.get("/me", requireAuth, authController.me);
authRoutes.patch("/me", requireAuth, authController.updateMe);
