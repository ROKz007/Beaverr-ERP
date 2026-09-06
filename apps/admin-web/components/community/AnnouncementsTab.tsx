"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Announcement } from "@repo/types";
import { api } from "../../lib/api";
import { DataTable, type Column } from "../DataTable";

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [receiptCounts, setReceiptCounts] = useState<Record<string, number>>({});

  async function load() {
    const { data } = await api.get("/api/announcements");
    setAnnouncements(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/admin/announcements", { title, body, isCritical });
    setTitle("");
    setBody("");
    setIsCritical(false);
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await api.delete(`/api/admin/announcements/${id}`);
    load();
  }

  async function checkReceipts(id: string) {
    const { data } = await api.get(`/api/admin/announcements/${id}/read-receipts`);
    setReceiptCounts((r) => ({ ...r, [id]: data.data.count }));
  }

  const columns: Column<Announcement>[] = [
    { key: "title", label: "Title" },
    { key: "isCritical", label: "Critical", render: (a) => (a.isCritical ? "Yes" : "No") },
    { key: "createdAt", label: "Posted", render: (a) => new Date(a.createdAt).toLocaleDateString() },
    {
      key: "receipts",
      label: "Read by",
      render: (a) => (
        <button onClick={() => checkReceipts(a.id)} className="text-xs text-accent hover:underline">
          {receiptCounts[a.id] !== undefined ? `${receiptCounts[a.id]} residents` : "Check"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (a) => (
        <button onClick={() => remove(a.id)} className="text-xs text-destructive hover:underline">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Post announcement"}</Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body">Body</Label>
              <Input id="body" value={body} onChange={(e) => setBody(e.target.value)} required />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} />
              Critical (track read receipts)
            </label>
            <Button type="submit" className="w-fit">
              Post
            </Button>
          </form>
        </Card>
      )}
      <Card>
        <DataTable columns={columns} rows={announcements} emptyMessage="No announcements yet." />
      </Card>
    </div>
  );
}
