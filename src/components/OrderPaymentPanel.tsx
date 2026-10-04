"use client";
import { useEffect, useState } from "react";
import PayOrderButton from "./PayOrderButton";

export default function OrderPaymentPanel({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<{ available: boolean; paymentStatus: string; cancelled: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null).then(setStatus).catch(() => {});
    return () => controller.abort();
  }, [orderId]);
  if (!status?.available || status.cancelled || status.paymentStatus === "refunded") return null;
  return <section className="my-6 rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="mb-3 text-lg font-semibold text-slate-900">{status.paymentStatus === "paid" ? "Paiement confirmé" : "Réglez votre commande en ligne"}</h2>
    {status.paymentStatus === "paid" ? <p className="text-sm text-emerald-700">Merci, votre commande est payée.</p> : <PayOrderButton orderId={orderId} />}
  </section>;
}
