"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import OrderPaymentPanel from "@/components/OrderPaymentPanel";
import { paymentMethodLabel } from "@/lib/order-payment";
import styles from "./Confirmation.module.css";
import checkoutStyles from "../Checkout.module.css";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  brand?: string;
}

interface OrderData {
  id: string;
  orderNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoLabel: string | null;
  total: number;
  deliveryFee?: number;
  customer: { firstName: string; lastName: string; city: string; phone: string };
  payment: string;
  date: string;
  status?: string;
}

const STEPS = [
  { key: "received", label: "Commande reçue", sub: "Votre commande est transmise à notre équipe" },
  { key: "processing", label: "Validation de la commande", sub: "Notre équipe vérifie les détails et vous accompagne pour le paiement" },
  { key: "shipped", label: "Expédiée", sub: "Le colis est expédié après confirmation du règlement" },
  { key: "delivered", label: "Livrée", sub: "Livraison à votre adresse" },
];

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get("id");

    // Try loading from DB first
    if (orderId) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setOrder({
              id: data.id,
              orderNumber: data.orderNumber ?? undefined,
              items: data.items.map((i: { name: string; image: string; price: number; qty: number; brand?: string }, idx: number) => ({ id: idx, ...i })),
              subtotal: data.subtotal,
              discount: data.promoDiscount ?? 0,
              promoLabel: data.promoCode ?? null,
              total: data.total,
              customer: { firstName: data.customerFirstName, lastName: data.customerLastName, city: data.city ?? "", phone: data.phone ?? "" },
              payment: data.paymentMethod,
              status: data.status,
              date: data.createdAt ?? new Date().toISOString(),
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // Fallback to localStorage for backward compatibility
      const timer = setTimeout(() => {
        const raw = localStorage.getItem("last-order-data");
        if (raw) {
          try { setOrder(JSON.parse(raw)); } catch { /* ignore */ }
        }
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const orderId = order?.orderNumber ?? order?.id ?? "";
  const stage = order?.status === "delivered" ? 4 : order?.status === "shipped" ? 3 : ["confirmed", "preparing"].includes(order?.status ?? "") ? 2 : 1;
  const steps = STEPS.map((step, i) => ({ ...step, done: i < stage, date: i < stage ? "Effectuée" : "En attente" }));

  const copy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => setCopied(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return <div className={styles.page}><div className={styles.empty}><p className={styles.eyebrow}>Votre commande</p><h1>Retrouvez votre commande</h1><p>Nous ne pouvons pas afficher cette commande. Consultez le suivi avec votre référence ou contactez notre équipe.</p><Link href="/suivi-commande" className={styles.primary}>Accéder au suivi</Link><Link href="/produits" className={styles.secondary}>Revenir à la boutique</Link></div></div>;
  const cancelled = order.status === "cancelled";
  const shipping = order.deliveryFee ?? Math.max(0, Math.round((order.total - order.subtotal + order.discount) * 100) / 100);
  const money = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
  return <div className={styles.page}>
    <div className={checkoutStyles.brandBar}><Link href="/" className={checkoutStyles.brand}>Electro<span>Shop-Tech</span></Link><Link href="/contact" className={checkoutStyles.secure}>Une question ? Contactez-nous</Link></div>
    <header className={styles.hero}><div className={styles.heroInner}>
      <div className={styles.seal} aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <p className={styles.eyebrow}>{cancelled ? "Commande annulée" : "Commande bien reçue"}</p>
      <h1>{cancelled ? "Votre commande a été annulée." : <>Merci{order.customer.firstName ? `, ${order.customer.firstName}` : ""}.<br/>La suite, c’est avec nous.</>}</h1>
      <p className={styles.heroText}>{cancelled ? "Contactez notre équipe si vous souhaitez être accompagné." : "Merci de votre confiance. Retrouvez les détails de votre commande et ses prochaines étapes ci-dessous."}</p>
      <div className={styles.reference}><div><span>Votre référence</span><strong>{orderId}</strong></div><button type="button" onClick={copy} aria-label="Copier la référence de commande">{copied ? "Copié ✓" : "Copier"}</button></div>
    </div></header>
    <div className={styles.content}><div className={styles.main}>
      <section className={styles.card} aria-labelledby="next-steps"><div className={styles.cardHeading}><div><p className={styles.eyebrow}>À vos côtés</p><h2 id="next-steps">{cancelled ? "Besoin d’aide ?" : "Et maintenant ?"}</h2></div><span className={styles.badge}>{cancelled ? "Annulée" : stage === 4 ? "Livrée" : "Suivi de commande"}</span></div>
        {cancelled ? <p className={styles.notice}>Notre équipe est disponible pour répondre à vos questions sur cette commande.</p> : <ol className={styles.timeline}>{steps.map((step, i) => <li key={step.key} className={step.done ? styles.done : ""}><span className={styles.stepNumber}>{step.done ? "✓" : `0${i + 1}`}</span><div><h3>{step.label}</h3><p>{step.sub}</p></div><span className={styles.stepState}>{step.done ? "Effectuée" : "À venir"}</span></li>)}</ol>}
        {!cancelled && <div className={styles.notice}>Le délai de livraison vous sera confirmé par notre équipe. L’expédition intervient après confirmation du règlement.</div>}
      </section>
      <OrderPaymentPanel orderId={order.id} />
      <section className={styles.assistance}><span className={styles.assistanceIcon} aria-hidden="true">↗</span><div><h2>Une équipe à votre écoute.</h2><p>Une question sur votre commande ? Nous sommes là pour vous accompagner.</p><Link href="/contact">Contacter notre équipe →</Link></div></section>
      <div className={styles.actions}><Link href={`/suivi-commande?id=${encodeURIComponent(orderId)}`} className={styles.primary}>Suivre ma commande <span aria-hidden="true">→</span></Link><Link href="/produits" className={styles.secondary}>Continuer mes achats</Link></div>
    </div>
    <aside className={styles.card} aria-labelledby="order-details"><div className={styles.cardHeading}><div><p className={styles.eyebrow}>Votre sélection</p><h2 id="order-details">Détails de la commande</h2></div></div>
      <div className={styles.items}>{order.items.map(item => <div key={item.id} className={styles.item}><div className={styles.itemImage}><Image src={item.image} alt={item.name} width={60} height={60} sizes="60px" className="object-contain"/></div><div className={styles.itemName}><h3>{item.name}</h3><p>Quantité : {item.qty}</p></div><strong>{money(item.price * item.qty)}</strong></div>)}</div>
      <dl className={styles.totals}><div><dt>Sous-total</dt><dd>{money(order.subtotal)}</dd></div>{order.discount > 0 && <div><dt>Réduction {order.promoLabel}</dt><dd>−{money(order.discount)}</dd></div>}<div><dt>Livraison</dt><dd>{shipping > 0 ? money(shipping) : "Offerte"}</dd></div><div className={styles.total}><dt>Total TTC</dt><dd>{money(order.total)}</dd></div></dl>
      <dl className={styles.details}><div><dt>Destinataire</dt><dd>{order.customer.firstName} {order.customer.lastName}{order.customer.city && <span>{order.customer.city}, France</span>}</dd></div><div><dt>Mode de paiement</dt><dd>{paymentMethodLabel(order.payment)}</dd></div><div><dt>Commande passée le</dt><dd>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(order.date))}</dd></div></dl>
    </aside></div>
  </div>;
}
export default function ConfirmationPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f6f5f2] flex items-center justify-center" role="status"><span className="text-sm text-slate-500">Chargement de votre commande…</span></div>}><ConfirmationContent /></Suspense>;
}
