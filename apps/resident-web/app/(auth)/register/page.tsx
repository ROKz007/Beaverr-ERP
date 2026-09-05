"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { api } from "../../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [societyCode, setSocietyCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/register", { societyCode, name, phone });
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
        <h2 className="font-heading text-xl font-semibold text-primary">Join your society</h2>
        <p className="text-sm text-muted">Ask your admin for your society's 6-digit code.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="societyCode">Society code</Label>
          <Input
            id="societyCode"
            placeholder="BVR001"
            value={societyCode}
            onChange={(e) => setSocietyCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Riya Resident" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
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
          {loading ? "Creating account…" : "Register"}
        </Button>
      </form>
    </>
  );
}
