import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHENTICATED", "Missing or malformed Authorization header.", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new AppError("TOKEN_EXPIRED", "Access token is invalid or expired.", 401);
  }
  next();
}
