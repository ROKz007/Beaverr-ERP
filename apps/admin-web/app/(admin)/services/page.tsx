"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Service, ServiceCategory } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";

const CATEGORIES: ServiceCategory[] = ["MAINTENANCE", "AMENITY", "COMMUNITY"];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("MAINTENANCE");
  const [subCategory, setSubCategory] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [price, setPrice] = useState("");
  const [slaHours, setSlaHours] = useState("24");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/api/services", { params: { page } });
    setServices(data.data);
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
      await api.post("/api/services", {
        name,
        description,
        category,
        subCategory,
        isPaid,
        price: isPaid && price ? Number(price) : undefined,
        slaHours: Number(slaHours),
      });
      setName("");
      setDescription("");
      setSubCategory("");
      setPrice("");
      setShowForm(false);
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await api.delete(`/api/services/${id}`);
    load();
  }

  const columns: Column<Service>[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (s) => `${s.category} / ${s.subCategory}` },
    { key: "price", label: "Price", render: (s) => (s.isPaid ? `₹${s.price ?? "—"}` : "Free") },
    { key: "slaHours", label: "SLA", render: (s) => `${s.slaHours}h` },
    {
      key: "isActive",
      label: "Status",
      render: (s) => <span className={s.isActive ? "text-success" : "text-white/40"}>{s.isActive ? "Active" : "Inactive"}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (s) => (
        <button onClick={() => remove(s.id)} className="text-xs text-destructive hover:underline">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Services
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Service catalogue</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add service"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subCategory">Sub-category</Label>
                <Input id="subCategory" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[15px] text-white outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slaHours">SLA (hours)</Label>
                <Input id="slaHours" type="number" value={slaHours} onChange={(e) => setSlaHours(e.target.value)} required />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input id="isPaid" type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                <Label htmlFor="isPaid">Paid</Label>
              </div>
              {isPaid && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Save service
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={services} emptyMessage="No services yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
