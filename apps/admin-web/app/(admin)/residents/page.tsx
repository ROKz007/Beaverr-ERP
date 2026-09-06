"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { User } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";

export default function ResidentsPage() {
  const [residents, setResidents] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/api/admin/residents", { params: { page } });
    setResidents(data.data);
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
      await api.post("/api/admin/residents", { name, phone, email: email || undefined });
      setName("");
      setPhone("");
      setEmail("");
      setShowForm(false);
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(resident: User) {
    await api.patch(`/api/admin/residents/${resident.id}/suspend`, { isActive: !resident.isActive });
    load();
  }

  const columns: Column<User>[] = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email", render: (r) => r.email ?? "—" },
    {
      key: "isActive",
      label: "Status",
      render: (r) => (
        <span className={r.isActive ? "text-success" : "text-destructive"}>{r.isActive ? "Active" : "Suspended"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button onClick={() => toggleActive(r)} className="text-xs text-accent hover:underline">
          {r.isActive ? "Suspend" : "Reactivate"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Residents
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Residents</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add resident"}</Button>
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
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Save resident
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={residents} emptyMessage="No residents yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
