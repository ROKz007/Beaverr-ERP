import type { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

const WINDOW_SECONDS = 60;
const RESIDENT_LIMIT = 100;
const ADMIN_LIMIT = 500;
const ANONYMOUS_LIMIT = 60;

const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD", "SUPER_ADMIN"]);

/**
 * Mounted globally ahead of every route, so it does its own lightweight JWT peek rather than
 * depending on a route-specific requireAuth having already run (a bad/missing token here just
 * falls back to IP-based limiting — requireAuth, later in the chain for routes that need it,
 * still rejects the request properly on its own terms).
 */
export async function rateLimiter(req: Request, _res: Response, next: NextFunction) {
  let key = `ratelimit:ip:${req.ip}`;
  let limit = ANONYMOUS_LIMIT;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      key = `ratelimit:user:${payload.userId}`;
      limit = ADMIN_ROLES.has(payload.role) ? ADMIN_LIMIT : RESIDENT_LIMIT;
    } catch {
      // invalid/expired — leave it on IP-based limiting, requireAuth will reject it downstream.
    }
  }

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > limit) {
    throw new AppError("RATE_LIMITED", "Too many requests. Please slow down.", 429);
  }
  next();
}
