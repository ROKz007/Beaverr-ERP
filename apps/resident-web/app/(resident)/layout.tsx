"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { useAuthStore } from "../../store/authStore";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/grievances", label: "Grievances" },
  { href: "/visitors", label: "Visitors" },
  { href: "/notifications", label: "Notifications" },
];

// TODO: no cookie-based middleware guard yet — access token lives in memory only.
// Fine for MVP Phase 1; add real route middleware once refresh-on-load is wired up.
export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-black/[0.06] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-heading text-lg font-semibold text-primary">🦫 Beaverr</span>
          <nav className="flex items-center gap-1 overflow-x-auto rounded-full bg-black/[0.04] p-1 dark:bg-white/5">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    active ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user?.name}</span>
            <Button variant="secondary" onClick={logout} className="px-4 py-2 text-xs">
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
