"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Worker } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/api/admin/workers", { params: { page } });
    setWorkers(data.data);
    setTotal(data.meta.total);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/admin/workers", {
        name,
        phone,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setName("");
      setPhone("");
      setSkills("");
      setShowForm(false);
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVerified(worker: Worker) {
    await api.patch(`/api/admin/workers/${worker.id}`, { isVerified: !worker.isVerified });
    load();
  }

  async function toggleAvailable(worker: Worker) {
    await api.patch(`/api/admin/workers/${worker.id}`, { isAvailable: !worker.isAvailable });
    load();
  }

  const columns: Column<Worker>[] = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "skills", label: "Skills", render: (w) => w.skills.join(", ") || "—" },
    { key: "ratingAvg", label: "Rating", render: (w) => w.ratingAvg.toFixed(1) },
    { key: "reputationScore", label: "Reputation", render: (w) => w.reputationScore.toFixed(0) },
    {
      key: "isVerified",
      label: "Verified",
      render: (w) => (
        <button onClick={() => toggleVerified(w)} className={w.isVerified ? "text-success" : "text-white/40"}>
          {w.isVerified ? "Yes" : "No"}
        </button>
      ),
    },
    {
      key: "isAvailable",
      label: "Available",
      render: (w) => (
        <button onClick={() => toggleAvailable(w)} className={w.isAvailable ? "text-success" : "text-white/40"}>
          {w.isAvailable ? "Yes" : "No"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Workers
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Worker profiles</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add worker"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Plumbing, Electrical" required />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Save worker
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={workers} emptyMessage="No workers yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
