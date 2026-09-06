"use client";

import { useState } from "react";
import { EventsTab } from "../../../components/community/EventsTab";
import { AnnouncementsTab } from "../../../components/community/AnnouncementsTab";
import { DocumentsTab } from "../../../components/community/DocumentsTab";
import { ForumModerationTab } from "../../../components/community/ForumModerationTab";

const TABS = [
  { key: "events", label: "Events" },
  { key: "announcements", label: "Announcements" },
  { key: "documents", label: "Documents" },
  { key: "forum", label: "Forum moderation" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function CommunityPage() {
  const [tab, setTab] = useState<TabKey>("events");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          Community
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Community</h1>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              tab === t.key ? "bg-white/10 text-white" : "text-white/50 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab />}
      {tab === "announcements" && <AnnouncementsTab />}
      {tab === "documents" && <DocumentsTab />}
      {tab === "forum" && <ForumModerationTab />}
    </div>
  );
}
