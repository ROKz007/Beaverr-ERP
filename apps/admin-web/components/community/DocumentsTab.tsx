"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Document } from "@repo/types";
import { api } from "../../lib/api";
import { DataTable, type Column } from "../DataTable";

export function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    const { data } = await api.get("/api/documents");
    setDocuments(data.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/admin/documents", { title, url, category });
    setTitle("");
    setUrl("");
    setCategory("");
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await api.delete(`/api/admin/documents/${id}`);
    load();
  }

  const columns: Column<Document>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "url", label: "URL", render: (d) => (
      <a href={d.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
        Open
      </a>
    ) },
    {
      key: "actions",
      label: "",
      render: (d) => (
        <button onClick={() => remove(d.id)} className="text-xs text-destructive hover:underline">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Publish document"}</Button>
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
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="bye-laws" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
            </div>
            <Button type="submit" className="w-fit">
              Publish
            </Button>
          </form>
        </Card>
      )}
      <Card>
        <DataTable columns={columns} rows={documents} emptyMessage="No documents yet." />
      </Card>
    </div>
  );
}
