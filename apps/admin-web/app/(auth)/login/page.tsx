"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { api } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/login", { phone });
      router.push(`/otp?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-xl font-semibold text-white">Admin log in</h2>
        <p className="text-sm text-white/50">Enter your phone number to receive a one-time code.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} arrow className="w-full">
          {loading ? "Sending OTP…" : "Send OTP"}
        </Button>
      </form>
      <a href="/guard-login" className="text-center text-sm text-warm hover:underline">
        Security guard? Log in with your desk credentials
      </a>
    </>
  );
}
