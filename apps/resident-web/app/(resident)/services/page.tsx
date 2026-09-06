"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import type { Service, ServiceCategory } from "@repo/types";
import { api } from "../../../lib/api";
import { CategoryIcon } from "../../../components/CategoryIcon";

const CATEGORIES: { value: ServiceCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "AMENITY", label: "Amenity" },
  { value: "COMMUNITY", label: "Community" },
];

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await api.get("/api/services", {
        params: { q: q || undefined, category: category === "ALL" ? undefined : category },
      });
      setServices(data.data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [q, category]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Services
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Book a service</h1>
        <p className="mt-2 text-sm text-muted">Maintenance, amenities, and community services in your society.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search services…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1 overflow-x-auto rounded-full bg-black/[0.04] p-1 dark:bg-white/5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={[
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                category === c.value ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary",
              ].join(" ")}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : services.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-muted">No services match your search.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <button
                onClick={() => router.push(`/services/${service.id}`)}
                className="flex w-full flex-col gap-4 p-6 text-left"
              >
                <div className="flex items-center justify-between">
                  <CategoryIcon category={service.category} />
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                    {service.subCategory}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-primary">{service.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{service.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-primary">
                    {service.isPaid ? `₹${service.price ?? "—"}` : "Free"}
                  </span>
                  <span className="text-xs text-muted">~{service.slaHours}h SLA</span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
