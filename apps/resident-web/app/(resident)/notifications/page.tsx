"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import type { Notification } from "@repo/types";
import { api } from "../../../lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  async function load() {
    const [notifsRes, prefRes] = await Promise.all([
      api.get("/api/notifications"),
      api.get("/api/notifications/preferences"),
    ]);
    setNotifications(notifsRes.data.data);
    setEmailEnabled(prefRes.data.data.email);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}/read`);
    load();
  }

  async function markAllRead() {
    await api.patch("/api/notifications/read-all");
    load();
  }

  async function remove(id: string) {
    await api.delete(`/api/notifications/${id}`);
    load();
  }

  async function toggleEmail() {
    const next = !emailEnabled;
    setEmailEnabled(next);
    await api.patch("/api/notifications/preferences", { email: next });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Notifications
          </span>
          <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Inbox</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={emailEnabled} onChange={toggleEmail} />
            Email me too
          </label>
          <Button variant="secondary" onClick={markAllRead} className="px-4 py-2 text-xs">
            Mark all read
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : notifications.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-muted">No notifications yet.</div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-4 p-5">
                <button onClick={() => !n.isRead && markRead(n.id)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                    <h3 className="font-heading text-sm font-semibold text-primary">{n.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</p>
                </button>
                <button onClick={() => remove(n.id)} className="text-xs text-destructive hover:underline">
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
