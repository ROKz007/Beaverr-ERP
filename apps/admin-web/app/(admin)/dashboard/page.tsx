"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../lib/api";
import { StatCard } from "../../../components/StatCard";

interface Dashboard {
  openBookings: number;
  pendingGrievances: number;
  visitorsToday: number;
  dues: { collected: number; outstanding: number; overdueCount: number };
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.get("/api/admin/analytics/dashboard").then(({ data }) => setStats(data.data));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className="p-8">
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Dashboard
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Welcome, {user?.name}</h1>
        </div>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Open requests" value={stats.openBookings} />
          <StatCard label="Pending grievances" value={stats.pendingGrievances} />
          <StatCard label="Visitors today" value={stats.visitorsToday} />
          <StatCard label="Dues outstanding" value={`₹${stats.dues.outstanding}`} />
        </div>
      )}
    </div>
  );
}
