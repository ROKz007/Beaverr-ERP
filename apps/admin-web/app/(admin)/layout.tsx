"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { useAuthStore } from "../../store/authStore";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/residents", label: "Residents" },
  { href: "/units", label: "Units" },
  { href: "/services", label: "Services" },
  { href: "/workers", label: "Workers" },
  { href: "/bookings", label: "Bookings" },
  { href: "/grievances", label: "Grievances" },
  { href: "/gate-console", label: "Gate Console" },
  { href: "/payments", label: "Payments" },
  { href: "/community", label: "Community" },
  { href: "/settings", label: "Settings" },
];

// TODO: no cookie-based middleware guard yet, same as resident-web. Add later.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-dvh bg-sidebar">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-sidebar/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <span className="font-heading text-lg font-semibold text-white">🦫 Beaverr Admin</span>
          <nav className="flex items-center gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    active ? "bg-white/10 text-white" : "text-white/50 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/50 lg:inline">{user?.name}</span>
            <Button variant="secondary" onClick={logout} className="px-4 py-2 text-xs">
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
