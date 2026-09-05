import { Card } from "@repo/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-sidebar px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 35% at 20% 15%, rgba(15,113,115,0.18), transparent), radial-gradient(40% 30% at 80% 85%, rgba(26,60,94,0.35), transparent)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Admin Portal
          </span>
          <h1 className="font-heading text-2xl font-semibold text-white">🦫 Beaverr</h1>
        </div>
        <Card>
          <div className="flex flex-col gap-6 p-8">{children}</div>
        </Card>
      </div>
    </main>
  );
}
