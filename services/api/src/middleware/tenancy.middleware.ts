import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

/** Runs after requireAuth. Appends societyId from the JWT to req for repositories to scope queries by. */
export function injectSocietyId(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError("UNAUTHENTICATED", "requireAuth must run before injectSocietyId.", 401);
  }
  req.societyId = req.user.societyId;
  next();
}
