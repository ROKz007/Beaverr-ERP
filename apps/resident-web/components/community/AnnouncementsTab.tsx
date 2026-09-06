"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import type { Announcement } from "@repo/types";
import { api } from "../../lib/api";

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await api.get("/api/announcements");
    setAnnouncements(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await api.post(`/api/announcements/${id}/read-receipt`);
    load();
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (announcements.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-muted">No announcements yet.</div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((a) => (
        <Card key={a.id}>
          <button onClick={() => !a.isRead && markRead(a.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
            <div>
              <div className="flex items-center gap-2">
                {!a.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                {a.isCritical && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-destructive">
                    Critical
                  </span>
                )}
                <h3 className="font-heading text-base font-semibold text-primary">{a.title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted">{a.body}</p>
              <p className="mt-1 text-xs text-muted">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}
