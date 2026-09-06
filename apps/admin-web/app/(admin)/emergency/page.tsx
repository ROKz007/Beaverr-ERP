"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import type { EmergencyEvent, EvacuationUnitStatus } from "@repo/types";
import { api } from "../../../lib/api";
import { getSocket } from "../../../lib/socket";
import { useAuthStore } from "../../../store/authStore";
import { DataTable, type Column } from "../../../components/DataTable";
import { StatCard } from "../../../components/StatCard";

export default function EmergencyPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "SOCIETY_ADMIN";
  const isGuard = user?.role === "GUARD";

  const [alert, setAlert] = useState<string | null>(null);
  const [sosMessage, setSosMessage] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [evacuation, setEvacuation] = useState<{
    event: EmergencyEvent;
    units: EvacuationUnitStatus[];
    counts: { total: number; safe: number; unaccounted: number; unknown: number };
  } | null>(null);

  const [log, setLog] = useState<EmergencyEvent[]>([]);

  useEffect(() => {
    const socket = getSocket();
    const onSos = (event: EmergencyEvent) => setAlert(`SOS: ${event.message ?? "Alert triggered"}`);
    const onBroadcast = (event: EmergencyEvent) => setAlert(`Broadcast: ${event.message}`);
    socket.on("sos:triggered", onSos);
    socket.on("emergency:broadcast", onBroadcast);
    return () => {
      socket.off("sos:triggered", onSos);
      socket.off("emergency:broadcast", onBroadcast);
    };
  }, []);

  useEffect(() => {
    if (isAdmin) loadLog();
  }, [isAdmin]);

  async function loadLog() {
    const { data } = await api.get("/api/admin/emergency/log", { params: { limit: 20 } });
    setLog(data.data);
  }

  async function triggerSecuritySos(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/emergency/security-sos", { message: sosMessage || undefined });
      setSosMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function sendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/admin/emergency/broadcast", { message: broadcastMessage });
      setBroadcastMessage("");
      loadLog();
    } finally {
      setBusy(false);
    }
  }

  async function startEvacuation() {
    setBusy(true);
    try {
      const { data } = await api.post("/api/admin/emergency/evacuation", {});
      await loadEvacuation(data.data.id);
      loadLog();
    } finally {
      setBusy(false);
    }
  }

  async function loadEvacuation(eventId: string) {
    const { data } = await api.get(`/api/admin/emergency/evacuation/${eventId}`);
    setEvacuation(data.data);
  }

  async function setUnitStatus(unitId: string, status: "SAFE" | "UNACCOUNTED") {
    if (!evacuation) return;
    await api.patch(`/api/admin/emergency/evacuation/${evacuation.event.id}/units`, { unitId, status });
    loadEvacuation(evacuation.event.id);
  }

  const evacuationColumns: Column<EvacuationUnitStatus>[] = [
    { key: "unit", label: "Unit", render: (u) => (u.unit ? `${u.unit.block ?? ""} ${u.unit.unitNumber}`.trim() : u.unitId) },
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <span
          className={
            u.status === "SAFE" ? "text-success" : u.status === "UNACCOUNTED" ? "text-destructive" : "text-white/40"
          }
        >
          {u.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (u) => (
        <div className="flex gap-3">
          <button onClick={() => setUnitStatus(u.unitId, "SAFE")} className="text-xs text-success hover:underline">
            Mark safe
          </button>
          <button onClick={() => setUnitStatus(u.unitId, "UNACCOUNTED")} className="text-xs text-destructive hover:underline">
            Mark unaccounted
          </button>
        </div>
      ),
    },
  ];

  const logColumns: Column<EmergencyEvent>[] = [
    { key: "type", label: "Type" },
    { key: "message", label: "Message", render: (e) => e.message ?? "—" },
    { key: "createdAt", label: "When", render: (e) => new Date(e.createdAt).toLocaleString() },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Emergency
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Emergency & SOS</h1>
      </div>

      {alert && (
        <div className="rounded-2xl bg-destructive/15 p-4 text-sm text-destructive">
          {alert}{" "}
          <button onClick={() => setAlert(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {isGuard && (
        <Card>
          <form onSubmit={triggerSecuritySos} className="flex flex-col gap-4 p-6">
            <p className="text-sm font-medium text-white">Trigger security SOS</p>
            <Input
              value={sosMessage}
              onChange={(e) => setSosMessage(e.target.value)}
              placeholder="Optional: what's happening, location…"
            />
            <Button type="submit" disabled={busy} className="w-fit bg-destructive">
              Trigger SOS
            </Button>
          </form>
        </Card>
      )}

      {isAdmin && (
        <>
          <Card>
            <form onSubmit={sendBroadcast} className="flex flex-col gap-4 p-6">
              <p className="text-sm font-medium text-white">Society-wide broadcast</p>
              <Input
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Fire drill, water shutdown, power cut…"
                required
              />
              <Button type="submit" disabled={busy} className="w-fit">
                Send broadcast
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Evacuation drill</p>
                <Button onClick={startEvacuation} disabled={busy} className="w-fit">
                  Start new drill
                </Button>
              </div>
              {evacuation && (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total units" value={evacuation.counts.total} />
                    <StatCard label="Safe" value={evacuation.counts.safe} />
                    <StatCard label="Unaccounted" value={evacuation.counts.unaccounted} />
                    <StatCard label="Unknown" value={evacuation.counts.unknown} />
                  </div>
                  <DataTable columns={evacuationColumns} rows={evacuation.units} emptyMessage="No units." />
                </>
              )}
            </div>
          </Card>

          <Card>
            <DataTable columns={logColumns} rows={log} emptyMessage="No emergency events yet." />
          </Card>
        </>
      )}
    </div>
  );
}
