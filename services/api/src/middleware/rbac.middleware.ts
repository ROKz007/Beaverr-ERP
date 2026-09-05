import type { Request, Response, NextFunction } from "express";
import type { Role } from "@repo/types";
import { AppError } from "../utils/AppError";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("UNAUTHENTICATED", "requireAuth must run before requireRole.", 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
    }
    next();
  };
}
