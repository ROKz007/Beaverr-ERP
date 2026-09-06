"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import type { ServiceBooking } from "@repo/types";
import { api } from "../../../lib/api";
import { StatusBadge } from "../../../components/StatusBadge";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/bookings").then(({ data }) => {
      setBookings(data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          My Bookings
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Your bookings</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-muted">
            No bookings yet.{" "}
            <button onClick={() => router.push("/services")} className="text-accent hover:underline">
              Browse services
            </button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <button
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <h3 className="font-heading text-base font-semibold text-primary">{booking.service.name}</h3>
                  <p className="mt-1 text-sm text-muted">{new Date(booking.scheduledAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={booking.status} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
