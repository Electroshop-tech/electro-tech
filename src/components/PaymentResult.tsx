"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PayOrderButton from "./PayOrderButton";

type PaymentSummary = { orderNumber: string; email: string; amountPaid: number | null; total: number; currency: string; paymentStatus: string; subscriptionSentAt: string | null; available: boolean; cancelled: boolean };

export default function PaymentResult({ orderId, cancelled = false }: { orderId: string; cancelled?: boolean }) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    async function check() {
      try {
        const response = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Impossible de vérifier le paiement.");
        setSummary(data); setError("");
        if (!cancelled && data.paymentStatus === "unpaid" && attempts++ < 30) timer = setTimeout(check, 3000);
        else setWaiting(!cancelled && data.paymentStatus === "unpaid");
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Erreur de connexion."); }
    }
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [orderId, cancelled, refresh]);
  const paid = summary?.paymentStatus === "paid";
  const failed = summary?.paymentStatus === "failed";
  return <section className="mx-auto my-10 max-w-xl px-4 sm:my-16">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-orange-600">Votre commande ElectroShop-Tech</p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{paid ? "Merci pour votre commande" : cancelled ? "Paiement interrompu" : failed ? "Paiement non abouti" : "Confirmation de votre paiement"}</h1>
      <div role="status" aria-live="polite" className="mt-4 text-sm leading-7 text-slate-600">
        {paid ? <><p>Votre paiement a été confirmé avec succès.</p><p>{summary.subscriptionSentAt ? "Votre abonnement a été envoyé par email." : "Votre abonnement vous sera envoyé par email."}</p></>
          : cancelled ? <p>Vous pouvez revenir à votre commande et réessayer. Cette interruption ne confirme aucun paiement.</p>
          : failed ? <p>Le paiement a échoué. Vous pouvez réessayer ci-dessous.</p>
          : summary?.paymentStatus === "refunded" ? <p>Cette commande a été remboursée.</p>
          : <p>{waiting ? "La confirmation prend plus de temps que prévu. Vérifiez à nouveau avant de payer une seconde fois." : "Nous attendons la confirmation sécurisée du prestataire. Cette page ne valide pas le paiement."}</p>}
      </div>
      {summary && <dl className="my-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div><dt className="text-slate-500">Numéro de commande</dt><dd className="break-all font-semibold text-slate-900">{summary.orderNumber}</dd></div>
        <div><dt className="text-slate-500">{paid ? "Montant payé" : "Montant de la commande"}</dt><dd className="font-semibold text-slate-900">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: summary.currency }).format(paid ? summary.amountPaid ?? summary.total : summary.total)}</dd></div>
        <div><dt className="text-slate-500">Adresse email</dt><dd className="break-all text-slate-900">{summary.email}</dd></div>
      </dl>}
      {error && <p role="alert" className="my-4 text-sm text-red-700">{error}</p>}
      {!orderId && <p className="my-4 text-sm text-slate-600">Aucune commande sélectionnée.</p>}
      {orderId && !paid && <button type="button" onClick={() => setRefresh(v => v + 1)} className="mb-4 text-sm font-semibold text-orange-700">Vérifier à nouveau le paiement</button>}
      {summary?.available && !summary.cancelled && !paid && summary.paymentStatus !== "refunded" && (cancelled || failed || waiting) && <PayOrderButton orderId={orderId} />}
      <Link className="mt-6 inline-flex text-sm font-semibold text-slate-700" href={orderId ? `/commander/confirmation?id=${encodeURIComponent(orderId)}` : "/produits"}>{orderId ? "Revenir à ma commande" : "Revenir à la boutique"} →</Link>
    </div>
  </section>;
}
