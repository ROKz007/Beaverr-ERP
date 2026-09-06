"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Visitor } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";

export default function GateConsolePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showBlacklistOnly, setShowBlacklistOnly] = useState(false);

  const [residentId, setResidentId] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [walkinError, setWalkinError] = useState<string | null>(null);
  const [walkinBusy, setWalkinBusy] = useState(false);

  const [qrToken, setQrToken] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanBusy, setScanBusy] = useState(false);

  async function load() {
    const { data } = await api.get(showBlacklistOnly ? "/api/admin/visitors/blacklist" : "/api/admin/visitors", {
      params: { limit: 50 },
    });
    setVisitors(data.data);
  }

  useEffect(() => {
    load();
  }, [showBlacklistOnly]);

  async function handleWalkin(e: React.FormEvent) {
    e.preventDefault();
    setWalkinBusy(true);
    setWalkinError(null);
    try {
      await api.post("/api/gate/walkin", { residentId, visitorName, visitorPhone: visitorPhone || undefined });
      setResidentId("");
      setVisitorName("");
      setVisitorPhone("");
      load();
    } catch (err: any) {
      setWalkinError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setWalkinBusy(false);
    }
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setScanBusy(true);
    setScanResult(null);
    try {
      const { data } = await api.get(`/api/gate/scan/${qrToken}`);
      setScanResult(`${data.data.visitorName} admitted — status ${data.data.status}.`);
      setQrToken("");
      load();
    } catch (err: any) {
      setScanResult(err.response?.data?.error?.message ?? "Scan failed.");
    } finally {
      setScanBusy(false);
    }
  }

  async function exitVisitor(id: string) {
    await api.patch(`/api/gate/visitors/${id}/exit`);
    load();
  }

  async function toggleBlacklist(visitor: Visitor) {
    await api.patch(`/api/admin/visitors/${visitor.id}/blacklist`, { isBlacklisted: !visitor.isBlacklisted });
    load();
  }

  const columns: Column<Visitor>[] = [
    { key: "visitorName", label: "Visitor" },
    { key: "visitorPhone", label: "Phone", render: (v) => v.visitorPhone ?? "—" },
    { key: "residentId", label: "Resident" },
    { key: "status", label: "Status" },
    {
      key: "isBlacklisted",
      label: "Blacklisted",
      render: (v) => (
        <button onClick={() => toggleBlacklist(v)} className={v.isBlacklisted ? "text-destructive" : "text-white/40"}>
          {v.isBlacklisted ? "Yes" : "No"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (v) =>
        v.status === "INSIDE" ? (
          <button onClick={() => exitVisitor(v.id)} className="text-xs text-accent hover:underline">
            Log exit
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Gate Console
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Gate Console</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleWalkin} className="flex flex-col gap-4 p-6">
            <p className="text-sm font-medium text-white">Log walk-in</p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="residentId">Visiting resident (user id)</Label>
              <Input id="residentId" value={residentId} onChange={(e) => setResidentId(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visitorName">Visitor name</Label>
                <Input id="visitorName" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visitorPhone">Phone (optional)</Label>
                <Input id="visitorPhone" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
              </div>
            </div>
            {walkinError && <p className="text-sm text-destructive">{walkinError}</p>}
            <Button type="submit" disabled={walkinBusy} className="w-fit">
              Log visitor
            </Button>
          </form>
        </Card>

        <Card>
          <form onSubmit={handleScan} className="flex flex-col gap-4 p-6">
            <p className="text-sm font-medium text-white">Scan gate code</p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qrToken">Gate code</Label>
              <Input id="qrToken" value={qrToken} onChange={(e) => setQrToken(e.target.value)} required />
            </div>
            {scanResult && <p className="text-sm text-white/70">{scanResult}</p>}
            <Button type="submit" disabled={scanBusy} className="w-fit">
              Admit
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 pb-0">
          <p className="text-sm font-medium text-white">Visitor log</p>
          <label className="flex items-center gap-2 text-xs text-white/50">
            <input type="checkbox" checked={showBlacklistOnly} onChange={(e) => setShowBlacklistOnly(e.target.checked)} />
            Blacklisted only
          </label>
        </div>
        <DataTable columns={columns} rows={visitors} emptyMessage="No visitors logged yet." />
      </Card>
    </div>
  );
}
