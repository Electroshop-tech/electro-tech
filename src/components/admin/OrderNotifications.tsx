"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Notice = { id: string; event: string; readAt: string | null; createdAt: string; phoneStatus: string; phoneChannel: string | null; phoneError: string | null;
  order: { id: string; orderNumber: string | null; customerName: string; total: number; paymentCurrency: string; paymentStatus: string; paymentMethod: string; status: string;
    emailDeliveries: { id: string; kind: string; status: string; error: string | null }[] } };
const emailLabels: Record<string, string> = { PENDING: "En attente", SENDING: "Envoi en cours", ACCEPTED: "Accepté par le service email", FAILED: "Échec — à relancer", UNKNOWN: "À vérifier dans Resend", SKIPPED: "Désactivé" };
const phoneLabels: Record<string, string> = { DISABLED: "Téléphone désactivé", PENDING: "Message en attente", SENDING: "Envoi en cours", ACCEPTED: "Message accepté par Twilio", FAILED: "Message refusé", UNKNOWN: "Envoi à vérifier dans Twilio" };

export default function OrderNotifications({ compact = false }: { compact?: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const newest = useRef<string | null>(null);
  const initialized = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store", signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Notifications indisponibles.");
      const rows: Notice[] = data.notifications;
      if (initialized.current && rows[0] && newest.current !== rows[0].id) setAnnouncement(rows[0].event === "PAYMENT_RECEIVED" ? "Un paiement vient d’être confirmé. Ouvrez les notifications pour traiter la commande." : "Nouvelle commande reçue. Ouvrez les notifications pour la consulter.");
      initialized.current = true; newest.current = rows[0]?.id ?? null;
      setNotices(rows); setUnread(data.unread); setError(""); setLoading(false);
    } catch (e) { if (!signal?.aborted) { setError(e instanceof Error ? e.message : "Notifications indisponibles."); setLoading(false); } }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    // The header owns one live connection for all notification views and the
    // orders page. Normal polling still works if streaming is unavailable.
    const source = compact && typeof EventSource !== "undefined" ? new EventSource("/api/admin/notifications/stream") : null;
    source?.addEventListener("orders", () => {
      window.dispatchEvent(new Event("admin-notifications-changed"));
      window.dispatchEvent(new Event("admin-orders-changed"));
    });
    const interval = setInterval(() => { if (document.visibilityState === "visible") void load(controller.signal); }, 20000);
    const refresh = () => { if (document.visibilityState === "visible") void load(controller.signal); };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("admin-notifications-changed", refresh);
    return () => { source?.close(); controller.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("admin-notifications-changed", refresh); };
  }, [load, compact]);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [open]);
  async function action(action: string, id?: string) {
    try {
      const res = await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id }), keepalive: action === "read" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action impossible.");
      await load(); window.dispatchEvent(new Event("admin-notifications-changed"));
    } catch (e) { setError(e instanceof Error ? e.message : "Action impossible."); }
  }
  const content = <>
    <div className="flex justify-between items-center gap-3 border-b border-slate-100 p-4"><div><h2 className="font-bold text-slate-900">Commandes à suivre</h2><p className="text-xs text-slate-500 mt-1">{unread} notification{unread !== 1 ? "s" : ""} non lue{unread !== 1 ? "s" : ""}</p></div>{unread > 0 && <button type="button" onClick={() => action("read_all")} className="text-xs text-orange-700 font-semibold">Tout marquer lu</button>}</div>
    {error && <p role="alert" className="p-4 text-xs text-red-700">{error} <button type="button" className="underline" onClick={() => load()}>Réessayer</button></p>}
    {loading && <p className="p-6 text-sm text-slate-500">Chargement…</p>}
    {!loading && !error && !notices.length && <div className="p-8 text-center"><p className="font-semibold text-slate-800">Vous êtes à jour</p><p className="text-sm text-slate-500 mt-2">Les prochaines commandes apparaîtront ici.</p></div>}
    <div className={compact ? "max-h-[60dvh] overflow-y-auto" : "divide-y divide-slate-100"}>
      {(compact ? notices.slice(0, 5) : notices).map(n => {
        const paid = n.order.paymentStatus === "PAID";
        const inactive = ["CANCELLED", "DELIVERED"].includes(n.order.status);
        return <article key={n.id} className={`p-4 sm:p-5 border-b border-slate-100 ${n.readAt ? "bg-white" : "bg-orange-50/40"}`}>
          <div className="flex items-start gap-3"><span className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${n.readAt ? "bg-slate-200" : "bg-orange-500"}`} /><div className="min-w-0 flex-1">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{n.event === "PAYMENT_RECEIVED" ? "Paiement confirmé" : "Nouvelle commande"}</h3><time className="text-[10px] text-slate-500" dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div>
            <p className="text-sm text-slate-600 mt-2 break-words">{n.order.customerName} · <strong className="text-slate-800">{n.order.total.toLocaleString("fr-FR", { style: "currency", currency: n.order.paymentCurrency })}</strong></p>
            <p className="text-xs text-slate-500 mt-1">Commande {n.order.orderNumber || n.order.id}</p>
            <p className={`text-xs font-medium mt-3 ${paid ? "text-emerald-700" : "text-amber-700"}`}>{inactive ? (n.order.status === "CANCELLED" ? "Commande annulée" : "Commande livrée") : paid ? "Payée — prête à être traitée" : n.order.paymentStatus === "FAILED" ? "Paiement échoué — à suivre" : n.order.paymentMethod === "assisted" ? "À contacter — accompagner le paiement avant expédition" : n.order.paymentMethod === "stripe" ? "En attente de paiement — ne pas expédier" : "À traiter — paiement à la livraison"}</p>
            {!compact && <><p className="text-[11px] text-slate-500 mt-2">{phoneLabels[n.phoneStatus] || n.phoneStatus}</p>{n.phoneError && <p className="text-xs text-red-700 mt-1">{n.phoneError}</p>}
              {n.order.emailDeliveries?.map(email => <div key={email.id} className="mt-2 text-xs">
                <p className={email.status === "FAILED" || email.status === "UNKNOWN" ? "text-red-700" : "text-slate-500"}>{email.kind === "CUSTOMER_CONFIRMATION" ? "Confirmation client" : "Email administrateur"} : {emailLabels[email.status] || email.status}</p>
                {email.error && <p className="text-red-700 mt-1">{email.error}</p>}
                {email.status === "FAILED" && <button type="button" onClick={() => action("retry_email", email.id)} className="mt-1 font-semibold text-orange-700">Relancer l’email</button>}
              </div>)}
            </>}
            <div className="flex flex-wrap gap-3 items-center mt-4"><a href={`/admin/orders?order=${encodeURIComponent(n.order.id)}`} onClick={() => { if (!n.readAt) void action("read", n.id); setOpen(false); }} className="text-xs font-semibold text-slate-900 border border-slate-200 bg-white rounded-lg px-3 py-2">{paid && !inactive ? "Traiter la commande" : "Voir la commande"} →</a>{!n.readAt && <button type="button" onClick={() => action("read", n.id)} className="text-xs text-slate-500">Marquer lu</button>}{!compact && n.phoneStatus === "FAILED" && <button type="button" onClick={() => action("retry", n.id)} className="text-xs text-orange-700">Relancer le message</button>}</div>
          </div></div>
        </article>;
      })}
    </div>
    {compact && <Link href="/admin/notifications" onClick={() => setOpen(false)} className="block p-4 text-center text-xs text-orange-700 font-bold">Toutes les notifications et réglages →</Link>}
  </>;
  if (!compact) return <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden">{content}</section>;
  return <div ref={box} className="relative">
    <button type="button" aria-label={`Notifications : ${unread} non lues`} aria-expanded={open} aria-controls="admin-order-notifications" onClick={() => { setOpen(o => !o); setAnnouncement(""); }} className="relative w-10 h-10 rounded-xl border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>{unread > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-orange-500 text-white text-[9px] font-bold min-w-4 px-1 border-2 border-white">{unread > 99 ? "99+" : unread}</span>}</button>
    {open && <div id="admin-order-notifications" className="fixed right-3 left-3 sm:left-auto sm:absolute sm:right-0 top-16 sm:top-12 sm:w-[390px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-[80]">{content}</div>}
    {announcement && !open && <div role="status" className="fixed top-20 right-4 left-4 sm:left-auto sm:w-80 rounded-xl bg-slate-900 text-white p-4 shadow-xl z-[70]"><button type="button" onClick={() => setAnnouncement("")} aria-label="Fermer l’alerte" className="float-right ml-3">×</button><p className="text-sm">{announcement}</p></div>}
  </div>;
}
