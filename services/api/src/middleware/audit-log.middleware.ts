import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD", "SUPER_ADMIN"]);

/**
 * Mounted globally ahead of every route (same reasoning as rate-limit.middleware.ts) — listens for
 * the response to finish rather than checking req.user immediately, so it runs after whichever
 * route-specific requireAuth populated it. Structured Winston logs, not a DB table — matches the
 * project's existing "Winston-only for MVP" observability trim (see Backend Development.md).
 */
export function auditLogger(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING_METHODS.has(req.method)) return next();

  res.on("finish", () => {
    const user = req.user;
    if (!user || !ADMIN_ROLES.has(user.role)) return;
    logger.info("audit", {
      userId: user.userId,
      role: user.role,
      societyId: user.societyId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
    });
  });

  next();
}
