import type { Role } from "@repo/types";

export interface AuthTokens {
  accessToken: string;
  user: {
    id: string;
    societyId: string;
    name: string;
    phone: string;
    email: string | null;
    role: Role;
    avatarUrl: string | null;
  };
}
