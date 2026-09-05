import bcrypt from "bcryptjs";
import type { FeatureFlags } from "@repo/types";
import { authRepository } from "./auth.repository";
import { sendOtp as sendOtpCode, verifyOtp as verifyOtpCode } from "../../utils/otp";
import { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeAllRefreshTokens } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import type { AuthTokens } from "./auth.types";

function toAuthUser(user: { id: string; societyId: string; name: string; phone: string; email: string | null; role: AuthTokens["user"]["role"]; avatarUrl: string | null }) {
  return {
    id: user.id,
    societyId: user.societyId,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

async function issueTokens(user: Parameters<typeof toAuthUser>[0]): Promise<{ tokens: AuthTokens; refreshToken: string }> {
  const payload = { userId: user.id, societyId: user.societyId, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = await issueRefreshToken(payload);
  return { tokens: { accessToken, user: toAuthUser(user) }, refreshToken };
}

export const authService = {
  async register(params: { societyCode: string; name: string; phone: string; email?: string }) {
    const society = await authRepository.findSocietyByCode(params.societyCode);
    if (!society) {
      throw new AppError("SOCIETY_CODE_INVALID", "Society code not found.", 400);
    }
    const existing = await authRepository.findUserByPhone(params.phone);
    if (existing) {
      throw new AppError("VALIDATION_ERROR", "An account with this phone number already exists.", 400);
    }
    await authRepository.createResident({ societyId: society.id, name: params.name, phone: params.phone, email: params.email });
    await sendOtpCode(params.phone);
  },

  /** Shared by /auth/login and /auth/send-otp — both require an existing account for the phone. */
  async sendOtpForExistingUser(phone: string) {
    const user = await authRepository.findUserByPhone(phone);
    if (!user) {
      throw new AppError("NOT_FOUND", "No account found for this phone number.", 404);
    }
    await sendOtpCode(phone);
  },

  async verifyOtp(phone: string, code: string): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    await verifyOtpCode(phone, code);
    const user = await authRepository.findUserByPhone(phone);
    if (!user) {
      throw new AppError("NOT_FOUND", "No account found for this phone number.", 404);
    }
    return issueTokens(user);
  },

  async guardLogin(phone: string, password: string): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    const user = await authRepository.findUserByPhone(phone);
    if (!user || user.role !== "GUARD" || !user.passwordHash) {
      throw new AppError("UNAUTHENTICATED", "Invalid guard credentials.", 401);
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new AppError("UNAUTHENTICATED", "Invalid guard credentials.", 401);
    }
    return issueTokens(user);
  },

  async refresh(refreshToken: string): Promise<{ tokens: Pick<AuthTokens, "accessToken">; newRefreshToken: string }> {
    try {
      const { payload, newRefreshToken } = await rotateRefreshToken(refreshToken);
      return { tokens: { accessToken: signAccessToken(payload) }, newRefreshToken };
    } catch {
      throw new AppError("UNAUTHENTICATED", "Refresh token is invalid or expired.", 401);
    }
  },

  async logout(userId: string) {
    await revokeAllRefreshTokens(userId);
  },

  async getMe(userId: string): Promise<AuthTokens["user"] & { features: FeatureFlags }> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found.", 404);
    }
    const society = await authRepository.findSocietyById(user.societyId);
    return { ...toAuthUser(user), features: (society?.features as unknown as FeatureFlags) ?? ({} as FeatureFlags) };
  },

  async updateMe(userId: string, data: { name?: string; avatarUrl?: string }) {
    const user = await authRepository.updateProfile(userId, data);
    return toAuthUser(user);
  },
};
