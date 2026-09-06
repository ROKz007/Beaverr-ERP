import type { ServiceCategory } from "@repo/types";

const COLORS: Record<ServiceCategory, string> = {
  MAINTENANCE: "bg-accent/10 text-accent",
  AMENITY: "bg-warm/15 text-warm",
  COMMUNITY: "bg-success/10 text-success",
};

const PATHS: Record<ServiceCategory, string> = {
  // wrench — maintenance
  MAINTENANCE: "M14.5 3.5a4 4 0 0 0-5.4 4.9L3 14.5 5.5 17l6.1-6.1a4 4 0 0 0 4.9-5.4L14 8 12 6l2.5-2.5Z",
  // sparkle — amenity
  AMENITY: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  // two people — community
  COMMUNITY: "M8 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c0-2.8 2.2-5 5-5s5 2.2 5 5M11 19c0-2.8 2.2-5 5-5s5 2.2 5 5",
};

export function CategoryIcon({ category }: { category: ServiceCategory }) {
  return (
    <span className={["flex h-10 w-10 items-center justify-center rounded-full", COLORS[category]].join(" ")}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={PATHS[category]} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
