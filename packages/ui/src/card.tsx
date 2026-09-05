import { ReactNode } from "react";

/**
 * Double-Bezel card: an outer shell (hairline ring, soft tint) housing an
 * inner core (its own background + inset highlight) for a machined,
 * physical feel instead of a flat div-on-background.
 */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={["rounded-[2rem] bg-black/[0.03] p-1.5 ring-1 ring-black/[0.05] dark:bg-white/5 dark:ring-white/10", className]
      .filter(Boolean)
      .join(" ")}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-[var(--card-bg)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        {children}
      </div>
    </div>
  );
}
