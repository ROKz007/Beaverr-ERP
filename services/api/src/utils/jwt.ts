import jwt from "jsonwebtoken";
import { randomUUID, createHash } from "node:crypto";
import type { Role } from "@repo/types";
import { env } from "../config/env";
import { redis } from "../config/redis";

export interface AccessTokenPayload {
  userId: string;
  societyId: string;
  role: Role;
}

interface RefreshTokenPayload extends AccessTokenPayload {
  jti: string;
}

function refreshTtlSeconds(): number {
  const match = /^(\d+)([smhd])$/.exec(env.JWT_REFRESH_EXPIRY);
  if (!match) return 7 * 24 * 60 * 60;
  const value = Number(match[1]);
  const unit = match[2] ?? "d";
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] ?? 86400);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

export async function issueRefreshToken(payload: AccessTokenPayload): Promise<string> {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, jti } satisfies RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions["expiresIn"],
  });
  await redis.set(`refresh:${payload.userId}:${jti}`, hashToken(token), "EX", refreshTtlSeconds());
  return token;
}

export async function rotateRefreshToken(
  token: string,
): Promise<{ payload: AccessTokenPayload; newRefreshToken: string }> {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload & jwt.JwtPayload;
  const key = `refresh:${decoded.userId}:${decoded.jti}`;
  const storedHash = await redis.get(key);
  if (!storedHash || storedHash !== hashToken(token)) {
    throw new Error("Refresh token not recognised or already rotated");
  }
  await redis.del(key);
  const payload: AccessTokenPayload = { userId: decoded.userId, societyId: decoded.societyId, role: decoded.role };
  const newRefreshToken = await issueRefreshToken(payload);
  return { payload, newRefreshToken };
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  const keys = await redis.keys(`refresh:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
