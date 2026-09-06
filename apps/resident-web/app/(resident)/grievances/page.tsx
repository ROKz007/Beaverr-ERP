"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import type { Grievance, GrievanceType } from "@repo/types";
import { api } from "../../../lib/api";

const TYPES: GrievanceType[] = ["WORKER", "NEIGHBOUR", "MANAGEMENT", "INFRASTRUCTURE"];

const STATUS_STYLE: Record<Grievance["status"], string> = {
  OPEN: "bg-warm/15 text-warm",
  IN_REVIEW: "bg-accent/10 text-accent",
  RESOLVED: "bg-success/10 text-success",
  CLOSED: "bg-black/10 text-muted",
};

export default function GrievancesPage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<GrievanceType>("WORKER");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await api.get("/api/grievances");
    setGrievances(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/grievances", { type, description, isAnonymous });
      setDescription("");
      setIsAnonymous(false);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Grievances
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Your complaints</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Raise complaint"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as GrievanceType)}
                className="rounded-full border border-black/[0.06] bg-black/[0.02] px-5 py-3 text-[15px] text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">What happened?</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Submit anonymously
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-fit">
              Submit
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : grievances.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-muted">No complaints raised yet.</div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {grievances.map((g) => (
            <Card key={g.id}>
              <button
                onClick={() => router.push(`/grievances/${g.id}`)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <h3 className="font-heading text-base font-semibold text-primary">{g.type}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{g.description}</p>
                </div>
                <span className={["rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[g.status]].join(" ")}>
                  {g.status}
                </span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
