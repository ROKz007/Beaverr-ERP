"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import type { Grievance, GrievanceStatus } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";

const NEXT_STATUS: Partial<Record<GrievanceStatus, GrievanceStatus>> = {
  OPEN: "IN_REVIEW",
  IN_REVIEW: "RESOLVED",
  RESOLVED: "CLOSED",
};

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [assignDrafts, setAssignDrafts] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await api.get("/api/admin/grievances", { params: { page } });
    setGrievances(data.data);
    setTotal(data.meta.total);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function assign(id: string) {
    const assignedToId = assignDrafts[id];
    if (!assignedToId) return;
    await api.patch(`/api/admin/grievances/${id}/assign`, { assignedToId });
    load();
  }

  async function advance(id: string, status: GrievanceStatus) {
    await api.patch(`/api/admin/grievances/${id}/status`, { status });
    load();
  }

  const columns: Column<Grievance>[] = [
    { key: "type", label: "Type" },
    {
      key: "raisedByUserId",
      label: "Raised by",
      render: (g) => g.raisedByUserId ?? "Anonymous",
    },
    { key: "description", label: "Description", render: (g) => <span className="line-clamp-1 max-w-xs">{g.description}</span> },
    { key: "status", label: "Status" },
    {
      key: "assign",
      label: "Assign to (user id)",
      render: (g) => (
        <div className="flex items-center gap-2">
          <input
            value={assignDrafts[g.id] ?? g.assignedToId ?? ""}
            onChange={(e) => setAssignDrafts((d) => ({ ...d, [g.id]: e.target.value }))}
            className="w-32 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-accent/50"
          />
          <button onClick={() => assign(g.id)} className="text-xs text-accent hover:underline">
            Set
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (g) => {
        const next = NEXT_STATUS[g.status];
        return next ? (
          <button onClick={() => advance(g.id, next)} className="text-xs text-accent hover:underline">
            Move to {next}
          </button>
        ) : null;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Grievances
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Grievances</h1>
      </div>

      <Card>
        <DataTable columns={columns} rows={grievances} emptyMessage="No grievances yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
