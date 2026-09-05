import { create } from "zustand";
import type { User, FeatureFlags } from "@repo/types";
import { setAccessToken } from "../lib/api";

interface AuthState {
  user: (User & { features?: FeatureFlags }) | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
