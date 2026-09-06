"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Event } from "@repo/types";
import { api } from "../../lib/api";
import { DataTable, type Column } from "../DataTable";

export function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startAt, setStartAt] = useState("");

  async function load() {
    const { data } = await api.get("/api/events");
    setEvents(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/admin/events", { title, description, category, startAt });
    setTitle("");
    setDescription("");
    setCategory("");
    setStartAt("");
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await api.delete(`/api/admin/events/${id}`);
    load();
  }

  const columns: Column<Event>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "startAt", label: "Starts", render: (e) => new Date(e.startAt).toLocaleString() },
    { key: "rsvpCount", label: "RSVPs", render: (e) => e.rsvpCount ?? 0 },
    {
      key: "actions",
      label: "",
      render: (e) => (
        <button onClick={() => remove(e.id)} className="text-xs text-destructive hover:underline">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Create event"}</Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Festival" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startAt">Starts at</Label>
              <Input id="startAt" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
            </div>
            <Button type="submit" className="w-fit">
              Publish
            </Button>
          </form>
        </Card>
      )}
      <Card>
        <DataTable columns={columns} rows={events} emptyMessage="No events yet." />
      </Card>
    </div>
  );
}
