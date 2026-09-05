import { Card } from "@repo/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 10%, rgba(15,113,115,0.06), transparent), radial-gradient(50% 35% at 85% 90%, rgba(26,60,94,0.05), transparent)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Resident Portal
          </span>
          <h1 className="font-heading text-2xl font-semibold text-primary">🦫 Beaverr</h1>
        </div>
        <Card>
          <div className="flex flex-col gap-6 p-8">{children}</div>
        </Card>
      </div>
    </main>
  );
}
