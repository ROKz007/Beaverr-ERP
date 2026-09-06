"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../lib/api";

const OPEN_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);
const OPEN_GRIEVANCE_STATUSES = new Set(["OPEN", "IN_REVIEW"]);

interface Stats {
  openBookings: number;
  unreadNotifications: number;
  openGrievances: number;
  upcomingEvents: number;
  duesOutstanding: number;
}

function StatTile({ label, value, href, onClick }: { label: string; value: string | number; href: string; onClick: (href: string) => void }) {
  return (
    <button onClick={() => onClick(href)} className="text-left">
      <Card>
        <div className="p-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
          <p className="mt-2 font-heading text-3xl font-semibold text-primary">{value}</p>
        </div>
      </Card>
    </button>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [bookings, notifications, grievances, events, payments] = await Promise.all([
        api.get("/api/bookings", { params: { limit: 50 } }),
        api.get("/api/notifications", { params: { isRead: false, limit: 1 } }),
        api.get("/api/grievances", { params: { limit: 50 } }),
        api.get("/api/events", { params: { limit: 1 } }),
        api.get("/api/payments", { params: { status: "PENDING", limit: 1 } }),
      ]);
      setStats({
        openBookings: bookings.data.data.filter((b: { status: string }) => OPEN_BOOKING_STATUSES.has(b.status)).length,
        unreadNotifications: notifications.data.meta.total,
        openGrievances: grievances.data.data.filter((g: { status: string }) => OPEN_GRIEVANCE_STATUSES.has(g.status)).length,
        upcomingEvents: events.data.meta.total,
        duesOutstanding: payments.data.meta.total,
      });
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <div className="p-8">
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Dashboard
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Welcome, {user?.name}</h1>
        </div>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Open bookings" value={stats.openBookings} href="/bookings" onClick={router.push} />
          <StatTile label="Unread" value={stats.unreadNotifications} href="/notifications" onClick={router.push} />
          <StatTile label="Open grievances" value={stats.openGrievances} href="/grievances" onClick={router.push} />
          <StatTile label="Upcoming events" value={stats.upcomingEvents} href="/community" onClick={router.push} />
          <StatTile label="Dues pending" value={stats.duesOutstanding} href="/payments" onClick={router.push} />
        </div>
      )}
    </div>
  );
}
