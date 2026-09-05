import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { AppError } from "../../utils/AppError";
import { registerSchema, phoneSchema, verifyOtpSchema, guardLoginSchema, updateMeSchema } from "./auth.validator";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
};

export const authController = {
  async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);
    await authService.register(body);
    res.status(201).json({ success: true, data: { message: "Registered. OTP sent." } });
  },

  async login(req: Request, res: Response) {
    const { phone } = phoneSchema.parse(req.body);
    await authService.sendOtpForExistingUser(phone);
    res.json({ success: true, data: { message: "OTP sent." } });
  },

  async sendOtp(req: Request, res: Response) {
    const { phone } = phoneSchema.parse(req.body);
    await authService.sendOtpForExistingUser(phone);
    res.json({ success: true, data: { message: "OTP sent." } });
  },

  async verifyOtp(req: Request, res: Response) {
    const { phone, code } = verifyOtpSchema.parse(req.body);
    const { tokens, refreshToken } = await authService.verifyOtp(phone, code);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    res.json({ success: true, data: tokens });
  },

  async guardLogin(req: Request, res: Response) {
    const { phone, password } = guardLoginSchema.parse(req.body);
    const { tokens, refreshToken } = await authService.guardLogin(phone, password);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    res.json({ success: true, data: tokens });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new AppError("UNAUTHENTICATED", "No refresh token cookie present.", 401);
    }
    const { tokens, newRefreshToken } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, newRefreshToken, REFRESH_COOKIE_OPTS);
    res.json({ success: true, data: tokens });
  },

  async logout(req: Request, res: Response) {
    if (req.user) {
      await authService.logout(req.user.userId);
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ success: true, data: { message: "Logged out." } });
  },

  async me(req: Request, res: Response) {
    const me = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: me });
  },

  async updateMe(req: Request, res: Response) {
    const body = updateMeSchema.parse(req.body);
    const updated = await authService.updateMe(req.user!.userId, body);
    res.json({ success: true, data: updated });
  },
};
