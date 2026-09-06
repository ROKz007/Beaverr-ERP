"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { ForumThread, ForumCategory } from "@repo/types";
import { api } from "../../lib/api";

const CATEGORIES: ForumCategory[] = ["FOR_SALE", "LOST_FOUND", "CARPOOL", "RECOMMENDATIONS", "GENERAL"];

export function ForumTab() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selected, setSelected] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState<ForumCategory>("GENERAL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");

  async function load() {
    const { data } = await api.get("/api/forum/threads");
    setThreads(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function openThread(id: string) {
    const { data } = await api.get(`/api/forum/threads/${id}`);
    setSelected(data.data);
  }

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/forum/threads", { category, title, body });
    setTitle("");
    setBody("");
    setShowForm(false);
    load();
  }

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    await api.post(`/api/forum/threads/${selected.id}/replies`, { body: replyBody });
    setReplyBody("");
    openThread(selected.id);
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => setSelected(null)} className="text-left text-sm text-muted hover:text-primary">
          ← Back to forum
        </button>
        <Card>
          <div className="flex flex-col gap-4 p-6">
            <span className="w-fit rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
              {selected.category}
            </span>
            <h2 className="font-heading text-xl font-semibold text-primary">{selected.title}</h2>
            <p className="text-sm text-muted">{selected.body}</p>
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          {(selected.replies ?? []).map((r) => (
            <Card key={r.id}>
              <div className="p-4 text-sm text-muted">{r.body}</div>
            </Card>
          ))}
        </div>
        <form onSubmit={reply} className="flex gap-2">
          <Input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply…" required />
          <Button type="submit" className="px-4 py-2 text-xs">
            Reply
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "New thread"}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={createThread} className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ForumCategory)}
                className="rounded-full border border-black/[0.06] bg-black/[0.02] px-5 py-3 text-[15px] text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body">Details</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                className="w-full rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <Button type="submit" className="w-fit">
              Post
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : threads.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-sm text-muted">No threads yet.</div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((t) => (
            <Card key={t.id}>
              <button onClick={() => openThread(t.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <div>
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                    {t.category}
                  </span>
                  <h3 className="mt-2 font-heading text-base font-semibold text-primary">{t.title}</h3>
                </div>
                <span className="text-xs text-muted">{t.replyCount ?? 0} replies</span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
