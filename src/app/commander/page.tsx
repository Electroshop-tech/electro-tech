"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckoutSummary from "./CheckoutSummary";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { normalizeFrenchPhone } from "@/lib/checkout-fr";
import { validateCheckout, type CheckoutFields } from "@/lib/checkout-validation";
import styles from "./Checkout.module.css";
import CheckoutPaymentSection from "@/components/CheckoutPaymentSection";


// Hoisted to module scope so they aren't recreated on every render (prevents
// label/error remounting & input flicker while typing in the checkout form).
const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={styles.fieldLabel}>{children}</label>
);
const Err = ({ msg, field }: { msg?: string; field: string }) =>
  msg ? <p id={`${field}-error`} role="alert" className={styles.error}>{msg}</p> : null;

export default function CommanderPage() {
  const router = useRouter();
  const { items: cart, cartTotal: subtotal, clearCart, sessionId } = useCart();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zip: "", notes: "",
  });
  const [payment, setPayment] = useState<"assisted" | "stripe">("assisted");
  const [paymentAvailable, setPaymentAvailable] = useState(false);
  useEffect(() => {
    fetch("/api/payments/config").then(r => r.json()).then(data => setPaymentAvailable(Boolean(data.available))).catch(() => {});
  }, []);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [checkedFields, setCheckedFields] = useState<Partial<Record<keyof CheckoutFields, boolean>>>({});
  const validationErrors = validateCheckout(form);
  const errors = Object.fromEntries(Object.entries(validationErrors).filter(([field]) => checkedFields[field as keyof CheckoutFields])) as Partial<CheckoutFields>;

  // Wait for a typing pause before showing the first warning. Once checked,
  // each field updates immediately, so correcting it clears its warning.
  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckedFields(previous => ({
        ...previous,
        ...Object.fromEntries(Object.entries(form).filter(([, value]) => value.trim()).map(([field]) => [field, true])),
      }));
    }, 700);
    return () => clearTimeout(timer);
  }, [form]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string; discount: number } | null>(null);

  const discount = promoApplied?.discount ?? 0;
  const [quotedDeliveryFee, setDeliveryFee] = useState(0);
  const deliveryFee = subtotal > 0 ? quotedDeliveryFee : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (subtotal <= 0) return;
    const city = form.city.trim();
    const params = new URLSearchParams({ subtotal: String(subtotal) });
    if (city) params.set("city", city);
    const t = setTimeout(() => {
      fetch(`/api/delivery-zones?${params.toString()}`)
        .then(r => r.json())
        .then(d => setDeliveryFee(Math.max(0, Number(d?.fee) || 0)))
        .catch(() => setDeliveryFee(0));
    }, 300);
    return () => clearTimeout(t);
  }, [subtotal, form.city]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const checkOnBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const field = e.target.name;
    if (Object.hasOwn(form, field)) setCheckedFields(previous => ({ ...previous, [field]: true }));
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (data.ok) {
        setPromoApplied({ code: data.code, label: data.label, discount: data.discount });
        setPromoError("");
      } else {
        setPromoApplied(null);
        setPromoError(data.error ?? "Code invalide");
      }
    } catch {
      setPromoError("Erreur réseau, réessayez");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    const errs = validateCheckout(form);
    setCheckedFields(Object.fromEntries(Object.keys(form).map(field => [field, true])));
    const firstInvalid = Object.keys(errs)[0];
    if (firstInvalid) {
      const input = e.currentTarget instanceof HTMLFormElement ? e.currentTarget.elements.namedItem(firstInvalid) : null;
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    setSubmitted(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.qty, image: i.image })),
          address: { street: form.address, city: form.city, postalCode: form.zip.trim(), country: "France" },
          paymentMethod: payment,
          notes: form.notes || undefined,
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: normalizeFrenchPhone(form.phone) },
          promoCode: promoApplied?.code,
          sessionId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitted(false);
        setSubmitError(data.error || "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      const orderId = data.order?.id;

      localStorage.setItem(
        "last-order-data",
        JSON.stringify({
          id: orderId,
          orderNumber: data.order?.orderNumber,
          items: cart,
          subtotal,
          discount: promoApplied?.discount ?? 0,
          promoLabel: promoApplied?.label ?? null,
          total,
          customer: { firstName: form.firstName, lastName: form.lastName, city: form.city, phone: form.phone },
          payment,
          deliveryFee,
          date: new Date().toISOString(),
        })
      );

      clearCart();
      router.push(`/commander/confirmation?id=${encodeURIComponent(orderId)}`);
    } catch {
      setSubmitted(false);
      setSubmitError("Erreur de connexion. Vérifiez votre connexion internet et réessayez.");
    }
  };

  const ic = (field: keyof typeof form) => `${styles.input} ${errors[field] ? styles.invalid : ""}`;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const summaryProps = { items: cart, subtotal, deliveryFee, total, promo: promoApplied };

  const isFormReady = Object.keys(validationErrors).length === 0;

  if (cart.length === 0 && !submitted) {
    return (
      <div className={`${styles.checkout} ${styles.emptyState}`}>
        <div className={styles.emptyCard}>
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>Votre panier attend vos essentiels.</p>
          <span>Découvrez notre sélection et trouvez ce qui vous correspond.</span>
          <Link href="/produits" className={styles.submitButton}>Découvrir les produits →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkout}>
      <header className={styles.header}>
        <div className={styles.brandBar}>
          <Link href="/" className={`${styles.brand} ${styles.checkoutBrand}`} aria-label="ElectroShop-Tech — Accueil"><Image src="/icon.svg" width={44} height={44} alt="" className={styles.brandMark} priority /><span className={styles.brandCopy}><span className={styles.wordmark}>Electro<span>Shop</span><small>-Tech</small></span><span className={styles.brandTagline}>ÉLECTRONIQUE & HIGH-TECH</span></span></Link>
          <span className={styles.secure}><LockIcon />Commande sécurisée</span>
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.intro}>
          <div className={styles.introToolbar}>
            <Link href="/panier" className={styles.backLink}><span aria-hidden="true">←</span> Retour au panier</Link>
            <span className={styles.stepCaption}>Étape 2 sur 3</span>
          </div>
          <h1>Finalisez votre commande</h1>
          <p className={styles.subtitle}>Quelques informations et votre commande sera prête.</p>
        </div>
        <form onSubmit={handleSubmit} onBlur={checkOnBlur} noValidate>
          <div className={styles.columns}>
            <nav className={styles.steps} aria-label="Progression de la commande">
              <Link href="/panier"><i aria-hidden="true">✓</i>Panier</Link><b aria-hidden="true" />
              <span className={styles.current} aria-current="step"><i aria-hidden="true">2</i>Coordonnées</span><b aria-hidden="true" />
              <span><i aria-hidden="true">3</i>Confirmation</span>
            </nav>

            <div className={styles.mobileSummary}>
              <button type="button" onClick={() => setShowMobileSummary(p => !p)} aria-expanded={showMobileSummary} aria-controls="mobile-order-summary" className={styles.summaryToggle}>
                <span><span className={styles.toggleTitle}>Votre commande <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={showMobileSummary ? styles.chevronOpen : undefined}><path d="m6 9 6 6 6-6" /></svg></span><span className={styles.toggleDetail}>{totalQty} article{totalQty > 1 ? "s" : ""}{deliveryFee <= 0 && <span className={styles.free}> · Livraison gratuite</span>}</span></span>
                <strong>{total.toLocaleString("fr-FR")} €</strong>
              </button>
              <div id="mobile-order-summary" hidden={!showMobileSummary}>
                <CheckoutSummary {...summaryProps} />
              </div>
            </div>

            <div className={styles.formColumn}>
              <CheckoutSection number="01" title="Informations personnelles" subtitle="Vos coordonnées de contact">
                <div className={styles.fieldGrid}>
                  <div>
                    <Label htmlFor="firstName">Prénom <span>*</span></Label>
                    <input id="firstName" name="firstName" aria-required="true" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? "firstName-error" : undefined} value={form.firstName} onChange={set("firstName")} placeholder="Votre prénom" className={ic("firstName")} autoComplete="given-name" />
                    <Err field="firstName" msg={errors.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom <span>*</span></Label>
                    <input id="lastName" name="lastName" aria-required="true" aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? "lastName-error" : undefined} value={form.lastName} onChange={set("lastName")} placeholder="Votre nom" className={ic("lastName")} autoComplete="family-name" />
                    <Err field="lastName" msg={errors.lastName} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone <span>*</span></Label>
                    <div className={styles.phone}>
                      <span className={styles.phoneCountry} aria-hidden="true">FR</span>
                      <input id="phone" name="phone" aria-required="true" aria-invalid={Boolean(errors.phone)} aria-describedby={`phone-help${errors.phone ? " phone-error" : ""}`} value={form.phone} onChange={set("phone")} placeholder="06 12 34 56 78" className={ic("phone")} type="tel" autoComplete="tel" />
                    </div>
                    <p id="phone-help" className={styles.helper}>Nous vous contacterons pour la livraison.</p>
                    <Err field="phone" msg={errors.phone} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email <span>*</span></Label>
                    <input id="email" name="email" aria-required="true" aria-invalid={Boolean(errors.email)} aria-describedby={`email-help${errors.email ? " email-error" : ""}`} value={form.email} onChange={set("email")} placeholder="vous@exemple.fr" className={ic("email")} type="email" autoComplete="email" />
                    <p id="email-help" className={styles.helper}>Pour recevoir la confirmation et le suivi de votre commande.</p>
                    <Err field="email" msg={errors.email} />
                  </div>
                </div>
              </CheckoutSection>

              <CheckoutSection number="02" title="Adresse de livraison" subtitle="Où souhaitez-vous recevoir votre commande ?">
                <div className={styles.fieldGrid}>
                  <div>
                    <Label htmlFor="city">Ville <span>*</span></Label>
                    <input id="city" name="city" aria-required="true" aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "city-error" : undefined} value={form.city} onChange={set("city")} placeholder="Votre ville" className={ic("city")} autoComplete="address-level2" />
                    <Err field="city" msg={errors.city} />
                  </div>
                  <div>
                    <Label htmlFor="zip">Code postal <span>*</span></Label>
                    <input id="zip" name="zip" aria-required="true" aria-invalid={Boolean(errors.zip)} aria-describedby={errors.zip ? "zip-error" : undefined} value={form.zip} onChange={set("zip")} placeholder="75002" className={ic("zip")} maxLength={5} inputMode="numeric" autoComplete="postal-code" />
                    <Err field="zip" msg={errors.zip} />
                  </div>
                  <div className={styles.fullWidth}>
                    <Label htmlFor="address">Adresse complète <span>*</span></Label>
                    <input id="address" name="address" aria-required="true" aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error" : undefined} value={form.address} onChange={set("address")} placeholder="Rue, quartier, numéro…" className={ic("address")} autoComplete="street-address" />
                    <Err field="address" msg={errors.address} />
                  </div>
                  <div className={styles.fullWidth}>
                    <Label htmlFor="notes">Complément d’adresse <small>(optionnel)</small></Label>
                    <textarea id="notes" name="notes" value={form.notes} onChange={set("notes")} aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? "notes-error" : undefined} placeholder="Étage, code porte, point de repère…" rows={2} className={`${ic("notes")} ${styles.notes}`} />
                    <Err field="notes" msg={errors.notes} />
                  </div>
                </div>
                <div className={styles.countryRow}><span>Pays de livraison</span><strong>France</strong></div>
              </CheckoutSection>

              <CheckoutSection number="03" title="Mode de livraison" subtitle="Votre commande, directement chez vous">
                <div className={styles.deliveryOption}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
                  <div><h3>Livraison à domicile</h3><p>Délai confirmé par notre équipe</p></div>
                  <strong className={deliveryFee <= 0 ? styles.free : undefined}>{deliveryFee > 0 ? `${deliveryFee.toLocaleString("fr-FR")} €` : "Gratuite"}</strong>
                  <span className={styles.selectedCheck} aria-label="Mode de livraison inclus">✓</span>
                </div>
              </CheckoutSection>

              <CheckoutPaymentSection value={payment} onChange={setPayment} cardAvailable={paymentAvailable} />

              <section className={styles.promoCard} aria-labelledby="promo-title">
                <h2 id="promo-title">Vous avez un code promo ?</h2>
                {promoApplied ? <div className={styles.promoSuccess} role="status">
                  <div><strong>{promoApplied.code}</strong><p>{promoApplied.label} · −{promoApplied.discount.toLocaleString("fr-FR")} €</p></div>
                  <button type="button" onClick={() => { setPromoApplied(null); setPromoCode(""); }}>Supprimer</button>
                </div> : <div className={styles.promoControls}>
                  <label htmlFor="promo-code" className="sr-only">Code promo</label>
                  <input id="promo-code" type="text" aria-invalid={Boolean(promoError)} aria-describedby={promoError ? "promo-error" : undefined} value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())} placeholder="Code promo" className={`${styles.input} ${styles.promoInput}`} />
                  <button type="button" onClick={applyPromo} disabled={promoLoading || !promoCode.trim()} aria-busy={promoLoading} className={styles.promoButton}>{promoLoading ? "Vérification…" : "Appliquer"}</button>
                </div>}
                {promoError && <p id="promo-error" role="alert" className={styles.error}>{promoError}</p>}
              </section>

              <div className={styles.submitArea}>
                <div className={styles.finalTotal}><span>Total TTC</span><strong>{total.toLocaleString("fr-FR")} €</strong></div>
                <button type="submit" disabled={submitted} aria-busy={submitted} aria-describedby="submit-help" className={styles.submitButton}>
                  {submitted ? <><svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity=".25" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" /></svg>Traitement en cours…</> : <><LockIcon /><span>Confirmer ma commande</span><span aria-hidden="true">→</span></>}
                </button>
                <p id="submit-help" className={styles.submitHelp}>{!isFormReady ? "Complétez les champs obligatoires pour continuer." : payment === "assisted" ? "Notre équipe vous accompagnera pour le règlement avant l’expédition." : "Vous pourrez régler par carte à l’étape suivante."}</p>
                {submitError && <p role="alert" className={styles.submitError}>{submitError}</p>}
                <p className={styles.privacy}><LockIcon /><span>Vos données servent au traitement de votre commande. <Link href="/confidentialite">Confidentialité</Link></span></p>
              </div>
            </div>

            <aside className={styles.summaryColumn} aria-labelledby="summary-title">
              <div className={styles.summary}>
                <div className={styles.summaryHeader}><h2 id="summary-title">Résumé de la commande</h2><p>{totalQty} article{totalQty > 1 ? "s" : ""} dans votre panier</p></div>
                <CheckoutSummary {...summaryProps} />
                <Link href="/panier" className={styles.editCart}>Modifier mon panier <span aria-hidden="true">↗</span></Link>
              </div>
              <div className={styles.summaryService}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3M4 11H3v7h4v-7zm16 0h1v7h-4v-7zM20 18c0 3-4 3-6 3" /></svg><div><strong>Une équipe à votre écoute</strong><p>Besoin d’aide pour votre commande ?</p><Link href="/contact">Contactez-nous →</Link></div></div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></svg>;
}

function CheckoutSection({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className={styles.card} aria-labelledby={`section-${number}`}>
    <header className={styles.cardHeader}><span className={styles.sectionNumber}>{number}</span><div><h2 id={`section-${number}`}>{title}</h2><p>{subtitle}</p></div></header>
    <div className={styles.cardBody}>{children}</div>
  </section>;
}
