"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Visitor } from "@repo/types";
import { api } from "../../../lib/api";

const STATUS_STYLE: Record<Visitor["status"], string> = {
  PENDING: "bg-warm/15 text-warm",
  APPROVED: "bg-accent/10 text-accent",
  DENIED: "bg-destructive/10 text-destructive",
  INSIDE: "bg-success/10 text-success",
  EXITED: "bg-black/10 text-muted",
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/api/visitors");
    setVisitors(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePreApprove(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/visitors/pre-approve", { visitorName, visitorPhone: visitorPhone || undefined });
      setVisitorName("");
      setVisitorPhone("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function respond(id: string, action: "approve" | "deny") {
    await api.patch(`/api/gate/visitors/${id}/${action}`);
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Visitors
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Your visitors</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Pre-approve visitor"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handlePreApprove} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visitorName">Visitor name</Label>
                <Input id="visitorName" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="visitorPhone">Phone (optional)</Label>
                <Input id="visitorPhone" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Generate gate code
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : visitors.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-muted">No visitors yet.</div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visitors.map((v) => (
            <Card key={v.id}>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-primary">{v.visitorName}</h3>
                    {v.visitorPhone && <p className="mt-1 text-sm text-muted">{v.visitorPhone}</p>}
                  </div>
                  <span className={["rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[v.status]].join(" ")}>
                    {v.status}
                  </span>
                </div>
                {v.status === "APPROVED" && v.qrToken && (
                  <p className="rounded-xl bg-black/[0.03] px-4 py-2 font-mono text-xs text-muted dark:bg-white/5">
                    Gate code: {v.qrToken}
                  </p>
                )}
                {v.status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button onClick={() => respond(v.id, "approve")} className="px-4 py-2 text-xs">
                      Approve
                    </Button>
                    <Button variant="secondary" onClick={() => respond(v.id, "deny")} className="px-4 py-2 text-xs">
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
