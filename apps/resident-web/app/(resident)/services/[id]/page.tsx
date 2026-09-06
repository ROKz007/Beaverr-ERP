"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Service } from "@repo/types";
import { api } from "../../../../lib/api";
import { CategoryIcon } from "../../../../components/CategoryIcon";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/api/services/${id}`).then(({ data }) => setService(data.data));
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/bookings", { serviceId: id, scheduledAt });
      router.push(`/bookings/${data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!service) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <button onClick={() => router.push("/services")} className="text-left text-sm text-muted hover:text-primary">
        ← Back to services
      </button>

      <Card>
        <div className="flex flex-col gap-6 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <CategoryIcon category={service.category} />
              <div>
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                  {service.subCategory}
                </span>
                <h1 className="mt-2 font-heading text-2xl font-semibold text-primary">{service.name}</h1>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted">{service.description}</p>

          <div className="flex gap-6 border-t border-black/[0.06] pt-6 text-sm">
            <div>
              <span className="text-muted">Price</span>
              <p className="font-medium text-primary">{service.isPaid ? `₹${service.price ?? "—"}` : "Free"}</p>
            </div>
            <div>
              <span className="text-muted">Est. duration</span>
              <p className="font-medium text-primary">{service.durationEstMins} mins</p>
            </div>
            <div>
              <span className="text-muted">SLA</span>
              <p className="font-medium text-primary">~{service.slaHours}h</p>
            </div>
          </div>

          <form onSubmit={handleBook} className="flex flex-col gap-4 border-t border-black/[0.06] pt-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduledAt">Preferred date & time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} arrow className="w-full">
              {submitting ? "Booking…" : "Confirm booking"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
