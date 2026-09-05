"use client";

import { Card } from "@repo/ui/card";
import { useAuthStore } from "../../../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <Card>
      <div className="p-8">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Dashboard
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-muted">
          Phase 2+ will add the service catalogue, bookings, grievances, visitors, and payments here.
        </p>
      </div>
    </Card>
  );
}
