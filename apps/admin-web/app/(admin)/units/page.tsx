"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Unit, UnitType } from "@repo/types";
import { api } from "../../../lib/api";
import { DataTable, type Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";

const UNIT_TYPES: UnitType[] = ["ONE_BHK", "TWO_BHK", "THREE_BHK", "VILLA"];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [type, setType] = useState<UnitType>("TWO_BHK");
  const [ownerDrafts, setOwnerDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get("/api/admin/units", { params: { page } });
    setUnits(data.data);
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
      await api.post("/api/admin/units", { block: block || undefined, floor: floor || undefined, unitNumber, type });
      setBlock("");
      setFloor("");
      setUnitNumber("");
      setShowForm(false);
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function setOwner(unitId: string) {
    const ownerUserId = ownerDrafts[unitId];
    if (!ownerUserId) return;
    await api.post(`/api/admin/units/${unitId}/transfer`, { ownerUserId });
    load();
  }

  const columns: Column<Unit>[] = [
    { key: "block", label: "Block", render: (u) => u.block ?? "—" },
    { key: "unitNumber", label: "Unit" },
    { key: "floor", label: "Floor", render: (u) => u.floor ?? "—" },
    { key: "type", label: "Type" },
    { key: "ownerUserId", label: "Owner user ID", render: (u) => u.ownerUserId ?? "Unassigned" },
    {
      key: "assign",
      label: "Assign owner",
      render: (u) => (
        <div className="flex items-center gap-2">
          <input
            value={ownerDrafts[u.id] ?? ""}
            onChange={(e) => setOwnerDrafts((d) => ({ ...d, [u.id]: e.target.value }))}
            placeholder="user id"
            className="w-32 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-accent/50"
          />
          <button onClick={() => setOwner(u.id)} className="text-xs text-accent hover:underline">
            Set
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Units
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Units</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add unit"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="block">Block (optional)</Label>
                <Input id="block" value={block} onChange={(e) => setBlock(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="floor">Floor (optional)</Label>
                <Input id="floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unitNumber">Unit number</Label>
                <Input id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as UnitType)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[15px] text-white outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {UNIT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-fit">
              Save unit
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} rows={units} emptyMessage="No units yet." />
        <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
