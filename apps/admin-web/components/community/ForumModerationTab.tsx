"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import type { ForumThread } from "@repo/types";
import { api } from "../../lib/api";
import { DataTable, type Column } from "../DataTable";

export function ForumModerationTab() {
  const [threads, setThreads] = useState<ForumThread[]>([]);

  async function load() {
    const { data } = await api.get("/api/admin/forum/threads");
    setThreads(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFlag(thread: ForumThread) {
    await api.patch(`/api/admin/forum/threads/${thread.id}/flag`, { isFlagged: !thread.isFlagged });
    load();
  }

  async function remove(id: string) {
    await api.delete(`/api/admin/forum/threads/${id}`);
    load();
  }

  const columns: Column<ForumThread>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "replyCount", label: "Replies", render: (t) => t.replyCount ?? 0 },
    {
      key: "isFlagged",
      label: "Flagged",
      render: (t) => (
        <button onClick={() => toggleFlag(t)} className={t.isFlagged ? "text-warm" : "text-white/40"}>
          {t.isFlagged ? "Yes" : "No"}
        </button>
      ),
    },
    {
      key: "isRemoved",
      label: "Status",
      render: (t) => (t.isRemoved ? <span className="text-destructive">Removed</span> : "Visible"),
    },
    {
      key: "actions",
      label: "",
      render: (t) =>
        !t.isRemoved ? (
          <button onClick={() => remove(t.id)} className="text-xs text-destructive hover:underline">
            Remove
          </button>
        ) : null,
    },
  ];

  return (
    <Card>
      <DataTable columns={columns} rows={threads} emptyMessage="No forum threads yet." />
    </Card>
  );
}
