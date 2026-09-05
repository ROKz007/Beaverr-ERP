"use client";

import { Card } from "@repo/ui/card";
import { useAuthStore } from "../../../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <Card>
      <div className="p-8">
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Dashboard
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-white/50">
          Phase 2+ will add residents/units tables, services/workers management, bookings, and the Gate Console here.
        </p>
      </div>
    </Card>
  );
}
