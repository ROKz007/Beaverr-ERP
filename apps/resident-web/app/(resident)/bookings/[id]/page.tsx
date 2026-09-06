"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import type { ServiceBooking, BookingStatus } from "@repo/types";
import { api } from "../../../../lib/api";
import { getSocket } from "../../../../lib/socket";
import { StatusBadge } from "../../../../components/StatusBadge";

const STEPS: { status: BookingStatus; label: string }[] = [
  { status: "PENDING", label: "Requested" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "COMPLETED", label: "Completed" },
];

function stepIndex(status: BookingStatus) {
  if (status === "RATED") return 3;
  const i = STEPS.findIndex((s) => s.status === status);
  return i === -1 ? 0 : i;
}

export default function BookingTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<ServiceBooking | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/bookings/${id}`).then(({ data }) => setBooking(data.data));

    const socket = getSocket();
    socket.emit("booking:subscribe", id);
    const onUpdate = (payload: ServiceBooking) => {
      if (payload.id === id) setBooking(payload);
    };
    socket.on("booking:update", onUpdate);
    return () => {
      socket.off("booking:update", onUpdate);
    };
  }, [id]);

  async function handleCancel() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post(`/api/bookings/${id}/cancel`);
      setBooking(data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post(`/api/bookings/${id}/rate`, { rating, ratingNote: ratingNote || undefined });
      setBooking(data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!booking) return <p className="text-sm text-muted">Loading…</p>;

  const canCancel = ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(booking.status);
  const canRate = booking.status === "COMPLETED";
  const currentStep = stepIndex(booking.status);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <button onClick={() => router.push("/bookings")} className="text-left text-sm text-muted hover:text-primary">
        ← Back to my bookings
      </button>

      <Card>
        <div className="flex flex-col gap-8 p-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                {booking.service.subCategory}
              </span>
              <h1 className="mt-2 font-heading text-2xl font-semibold text-primary">{booking.service.name}</h1>
              <p className="mt-1 text-sm text-muted">{new Date(booking.scheduledAt).toLocaleString()}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {booking.status === "CANCELLED" ? (
            <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">This booking was cancelled.</p>
          ) : (
            <div className="flex items-center gap-2">
              {STEPS.map((step, i) => (
                <div key={step.status} className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={[
                        "h-3 w-3 rounded-full transition-colors duration-500",
                        i <= currentStep ? "bg-accent" : "bg-black/10 dark:bg-white/10",
                      ].join(" ")}
                    />
                    <span className="whitespace-nowrap text-[11px] text-muted">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={[
                        "h-px flex-1 transition-colors duration-500",
                        i < currentStep ? "bg-accent" : "bg-black/10 dark:bg-white/10",
                      ].join(" ")}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {booking.worker && (
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Assigned to</p>
                <p className="mt-1 font-medium text-primary">{booking.worker.name}</p>
                <p className="text-sm text-muted">{booking.worker.phone}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm dark:bg-black/40">
                ★ {booking.worker.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {canRate && (
            <form onSubmit={handleRate} className="flex flex-col gap-3 border-t border-black/[0.06] pt-6">
              <p className="text-sm font-medium text-primary">Rate this service</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={["text-2xl transition-colors", n <= rating ? "text-warm" : "text-black/10 dark:text-white/10"].join(" ")}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                placeholder="Optional note…"
                className="w-full rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                rows={3}
              />
              <Button type="submit" disabled={busy || rating === 0} className="w-fit">
                Submit rating
              </Button>
            </form>
          )}

          {canCancel && (
            <div className="border-t border-black/[0.06] pt-6">
              <Button variant="secondary" onClick={handleCancel} disabled={busy}>
                Cancel booking
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
