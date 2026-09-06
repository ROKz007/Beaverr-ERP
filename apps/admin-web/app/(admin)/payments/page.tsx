"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Payment, PaymentType } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { StatCard } from "../../../components/StatCard";

const TYPES: PaymentType[] = ["MAINTENANCE", "SERVICE"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ collected: number; outstanding: number; overdueCount: number } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [userId, setUserId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>("MAINTENANCE");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [paymentsRes, summaryRes] = await Promise.all([
      api.get("/api/admin/payments", { params: { page } }),
      api.get("/api/admin/payments/summary"),
    ]);
    setPayments(paymentsRes.data.data);
    setTotal(paymentsRes.data.meta.total);
    setSummary(summaryRes.data.data);
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/admin/payments", {
        userId,
        unitId,
        amount: Number(amount),
        type,
        dueDate: dueDate || undefined,
      });
      setUserId("");
      setUnitId("");
      setAmount("");
      setDueDate("");
      setShowForm(false);
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Payment>[] = [
    { key: "userId", label: "Resident" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount", render: (p) => `₹${p.amount}` },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due", render: (p) => (p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—") },
    { key: "paidAt", label: "Paid", render: (p) => (p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Payments
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Dues & payments</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Create due"}</Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Collected" value={`₹${summary.collected}`} />
          <StatCard label="Outstanding" value={`₹${summary.outstanding}`} />
          <StatCard label="Overdue" value={summary.overdueCount} />
        </div>
      )}

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="userId">Resident (user id)</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unitId">Unit id</Label>
                <Input id="unitId" value={unitId} onChange={(e) => setUnitId(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as PaymentType)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[15px] text-white outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dueDate">Due date (optional)</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Create due
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={payments} emptyMessage="No payments yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
