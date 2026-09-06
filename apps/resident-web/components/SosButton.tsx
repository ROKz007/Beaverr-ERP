"use client";

import { useState } from "react";
import { api } from "../lib/api";

export function SosButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function trigger() {
    setBusy(true);
    try {
      await api.post("/api/emergency/sos", { message: message || undefined });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setMessage("");
      }, 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
      >
        SOS
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/[0.06] dark:bg-[var(--card-bg)] dark:ring-white/10">
          {sent ? (
            <p className="text-sm text-success">Security has been alerted.</p>
          ) : (
            <>
              <p className="text-sm font-medium text-primary">Trigger an SOS alert?</p>
              <p className="mt-1 text-xs text-muted">This immediately notifies security and society admins.</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional: what's happening, your location…"
                rows={2}
                className="mt-3 w-full rounded-xl border border-black/[0.06] bg-black/[0.02] px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={trigger}
                  disabled={busy}
                  className="flex-1 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Confirm SOS"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-black/[0.04] px-4 py-2 text-xs text-muted dark:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
