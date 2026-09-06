"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import type { Grievance } from "@repo/types";
import { api } from "../../../../lib/api";

const STATUS_STYLE: Record<Grievance["status"], string> = {
  OPEN: "bg-warm/15 text-warm",
  IN_REVIEW: "bg-accent/10 text-accent",
  RESOLVED: "bg-success/10 text-success",
  CLOSED: "bg-black/10 text-muted",
};

export default function GrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [grievance, setGrievance] = useState<Grievance | null>(null);

  useEffect(() => {
    api.get(`/api/grievances/${id}`).then(({ data }) => setGrievance(data.data));
  }, [id]);

  if (!grievance) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <button onClick={() => router.push("/grievances")} className="text-left text-sm text-muted hover:text-primary">
        ← Back to grievances
      </button>

      <Card>
        <div className="flex flex-col gap-6 p-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                {grievance.type}
              </span>
              <h1 className="mt-2 font-heading text-2xl font-semibold text-primary">
                {grievance.isAnonymous ? "Anonymous complaint" : "Your complaint"}
              </h1>
            </div>
            <span className={["rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[grievance.status]].join(" ")}>
              {grievance.status}
            </span>
          </div>

          <p className="text-sm text-muted">{grievance.description}</p>

          <div className="flex gap-6 border-t border-black/[0.06] pt-6 text-sm">
            <div>
              <span className="text-muted">Raised</span>
              <p className="font-medium text-primary">{new Date(grievance.createdAt).toLocaleString()}</p>
            </div>
            {grievance.resolvedAt && (
              <div>
                <span className="text-muted">Resolved</span>
                <p className="font-medium text-primary">{new Date(grievance.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
