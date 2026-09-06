"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import type { Payment } from "@repo/types";
import { api } from "../../../lib/api";
import { getSocket } from "../../../lib/socket";
import { openRazorpayCheckout } from "../../../lib/razorpay";

const STATUS_STYLE: Record<Payment["status"], string> = {
  PENDING: "bg-warm/15 text-warm",
  PAID: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-black/10 text-muted",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await api.get("/api/payments");
    setPayments(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    const onReceived = () => load();
    socket.on("payment:received", onReceived);
    return () => {
      socket.off("payment:received", onReceived);
    };
  }, []);

  async function pay(payment: Payment) {
    setPayingId(payment.id);
    setError(null);
    try {
      const { data } = await api.post(`/api/payments/${payment.id}/initiate`);
      await openRazorpayCheckout({
        keyId: data.data.keyId,
        orderId: data.data.order.id,
        amount: payment.amount,
        name: `${payment.type} dues`,
        onSuccess: () => load(),
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Could not start payment.");
    } finally {
      setPayingId(null);
    }
  }

  const dues = payments.filter((p) => p.status === "PENDING");
  const history = payments.filter((p) => p.status !== "PENDING");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Payments
        </span>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-primary">Dues & payment history</h1>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted">Outstanding dues</h2>
            {dues.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-sm text-muted">No outstanding dues.</div>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {dues.map((p) => (
                  <Card key={p.id}>
                    <div className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-primary">{p.type}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {p.dueDate ? `Due ${new Date(p.dueDate).toLocaleDateString()}` : "No due date"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-heading text-lg font-semibold text-primary">₹{p.amount}</span>
                        <Button onClick={() => pay(p)} disabled={payingId === p.id} className="px-4 py-2 text-xs">
                          {payingId === p.id ? "Starting…" : "Pay"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-muted">History</h2>
            {history.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-sm text-muted">No past payments yet.</div>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((p) => (
                  <Card key={p.id}>
                    <div className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-primary">{p.type}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {p.paidAt ? new Date(p.paidAt).toLocaleString() : new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-heading text-lg font-semibold text-primary">₹{p.amount}</span>
                        <span className={["rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[p.status]].join(" ")}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
