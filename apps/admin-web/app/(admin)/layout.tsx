"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { useAuthStore } from "../../store/authStore";

// TODO: no cookie-based middleware guard yet, same as resident-web. Add later.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh bg-sidebar">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-sidebar/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <span className="font-heading text-lg font-semibold text-white">🦫 Beaverr Admin</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">{user?.name}</span>
            <Button variant="secondary" onClick={logout} className="px-4 py-2 text-xs">
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
