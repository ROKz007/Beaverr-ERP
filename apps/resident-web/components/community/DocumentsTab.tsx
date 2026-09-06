"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import type { Document } from "@repo/types";
import { api } from "../../lib/api";

export function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/documents").then(({ data }) => {
      setDocuments(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (documents.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-muted">No documents published yet.</div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((d) => (
        <Card key={d.id}>
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 p-5"
          >
            <div>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                {d.category}
              </span>
              <h3 className="mt-2 font-heading text-base font-semibold text-primary">{d.title}</h3>
            </div>
            <span className="text-xs text-accent">Download →</span>
          </a>
        </Card>
      ))}
    </div>
  );
}
