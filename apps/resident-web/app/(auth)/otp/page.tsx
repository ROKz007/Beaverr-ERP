"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

function OtpForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const phone = useSearchParams().get("phone") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/verify-otp", { phone, code });
      login(data.data.accessToken, data.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-xl font-semibold text-primary">Enter the code</h2>
        <p className="text-sm text-muted">
          Sent to {phone}. Dev mode: check the API console log.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="text-center tracking-[0.5em]"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} arrow className="w-full">
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
