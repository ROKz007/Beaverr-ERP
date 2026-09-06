"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import type { Event } from "@repo/types";
import { api } from "../../lib/api";

export function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [headcounts, setHeadcounts] = useState<Record<string, number>>({});

  async function load() {
    const { data } = await api.get("/api/events");
    setEvents(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function rsvp(id: string) {
    await api.post(`/api/events/${id}/rsvp`, { headcount: headcounts[id] ?? 1 });
    load();
  }

  async function cancelRsvp(id: string) {
    await api.delete(`/api/events/${id}/rsvp`);
    load();
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (events.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-muted">No upcoming events.</div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((e) => (
        <Card key={e.id}>
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                {e.category}
              </span>
              <h3 className="mt-2 font-heading text-base font-semibold text-primary">{e.title}</h3>
              <p className="mt-1 text-sm text-muted">{new Date(e.startAt).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted">{e.rsvpCount ?? 0} going</p>
            </div>
            <div className="flex items-center gap-2">
              {e.myHeadcount ? (
                <Button variant="secondary" onClick={() => cancelRsvp(e.id)} className="px-4 py-2 text-xs">
                  Cancel RSVP ({e.myHeadcount})
                </Button>
              ) : (
                <>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={headcounts[e.id] ?? 1}
                    onChange={(ev) => setHeadcounts((h) => ({ ...h, [e.id]: Number(ev.target.value) }))}
                    className="w-14 rounded-full border border-black/[0.06] bg-black/[0.02] px-2 py-2 text-center text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <Button onClick={() => rsvp(e.id)} className="px-4 py-2 text-xs">
                    RSVP
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
