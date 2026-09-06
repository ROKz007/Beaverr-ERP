import type { BookingStatus } from "@repo/types";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-warm/15 text-warm",
  CONFIRMED: "bg-accent/15 text-accent",
  IN_PROGRESS: "bg-accent/15 text-accent",
  COMPLETED: "bg-success/15 text-success",
  CANCELLED: "bg-destructive/15 text-destructive",
  RESCHEDULED: "bg-warm/15 text-warm",
  RATED: "bg-success/15 text-success",
};

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  RATED: "Rated",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={["rounded-full px-3 py-1 text-xs font-medium", STYLES[status]].join(" ")}>{LABELS[status]}</span>;
}
