import { Card } from "@repo/ui/card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.15em] text-white/40">{label}</p>
        <p className="mt-2 font-heading text-3xl font-semibold text-white">{value}</p>
      </div>
    </Card>
  );
}
