"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import type { ServiceBooking, Worker, BookingStatus } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { StatusBadge } from "../../../components/StatusBadge";

const NEXT_STATUS: Partial<Record<BookingStatus, { label: string; status: BookingStatus }>> = {
  CONFIRMED: { label: "Start", status: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete", status: "COMPLETED" },
};

const CANCELLABLE = new Set<BookingStatus>(["PENDING", "CONFIRMED", "RESCHEDULED"]);

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    const [bookingsRes, workersRes] = await Promise.all([
      api.get("/api/bookings", { params: { page } }),
      api.get("/api/admin/workers", { params: { limit: 100 } }),
    ]);
    setBookings(bookingsRes.data.data);
    setTotal(bookingsRes.data.meta.total);
    setWorkers(workersRes.data.data);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function assign(bookingId: string, workerId: string) {
    if (!workerId) return;
    await api.post(`/api/bookings/${bookingId}/assign`, { workerId });
    load();
  }

  async function advance(bookingId: string, status: BookingStatus) {
    await api.patch(`/api/bookings/${bookingId}/status`, { status });
    load();
  }

  async function cancel(bookingId: string) {
    await api.post(`/api/bookings/${bookingId}/cancel`);
    load();
  }

  const columns: Column<ServiceBooking>[] = [
    {
      key: "resident",
      label: "Resident",
      render: (b) => (b.resident ? `${b.resident.name} · ${b.resident.phone}` : "—"),
    },
    { key: "service", label: "Service", render: (b) => b.service.name },
    { key: "scheduledAt", label: "Scheduled", render: (b) => new Date(b.scheduledAt).toLocaleString() },
    { key: "status", label: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "worker",
      label: "Worker",
      render: (b) =>
        b.worker ? (
          b.worker.name
        ) : (
          <select
            defaultValue=""
            onChange={(e) => assign(b.id, e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="" disabled>
              Assign…
            </option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (b) => {
        const next = NEXT_STATUS[b.status];
        return (
          <div className="flex items-center gap-3">
            {next && (
              <button onClick={() => advance(b.id, next.status)} className="text-xs text-accent hover:underline">
                {next.label}
              </button>
            )}
            {CANCELLABLE.has(b.status) && (
              <button onClick={() => cancel(b.id)} className="text-xs text-destructive hover:underline">
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Bookings
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Bookings</h1>
      </div>

      <Card>
        <DataTable columns={columns} rows={bookings} emptyMessage="No bookings yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
