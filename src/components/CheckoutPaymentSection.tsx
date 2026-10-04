"use client";

import styles from "./CheckoutPaymentSection.module.css";

type Method = "assisted" | "stripe";

export default function CheckoutPaymentSection({ value, onChange, cardAvailable }: {
  value: Method; onChange: (method: Method) => void; cardAvailable: boolean;
}) {
  return <section className={styles.card} aria-labelledby="checkout-payment-title">
    <header className={styles.header}>
      <span className={styles.step}>04</span>
      <div><h2 id="checkout-payment-title">Mode de paiement</h2><p>Un règlement simple, à votre rythme.</p></div>
    </header>
    <div className={styles.body}>
      <fieldset className={styles.methods}>
        <legend className={styles.srOnly}>Choisissez votre mode de paiement</legend>
        <label className={`${styles.option} ${value === "assisted" ? styles.selected : ""}`}>
          <input type="radio" name="payment" value="assisted" checked={value === "assisted"} onChange={() => onChange("assisted")} className={styles.srOnly} />
          <div className={styles.optionTop}>
            <span className={styles.icon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3M4 11H3v7h4v-7zm16 0h1v7h-4v-7zM20 18c0 3-4 3-6 3"/><path d="M11 21h3" strokeLinecap="round"/></svg></span>
            <div className={styles.optionHeading}><strong>Paiement accompagné</strong><span>Avec un conseiller, avant l’expédition</span></div>
            <span className={styles.radio} aria-hidden="true">{value === "assisted" && "✓"}</span>
          </div>
        </label>
        {cardAvailable && <label className={`${styles.option} ${value === "stripe" ? styles.selected : ""}`}>
          <input type="radio" name="payment" value="stripe" checked={value === "stripe"} onChange={() => onChange("stripe")} className={styles.srOnly} />
          <div className={styles.optionTop}>
            <span className={styles.icon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/></svg></span>
            <div className={styles.optionHeading}><strong>Carte bancaire</strong><span>Visa · Mastercard</span></div>
            <span className={styles.radio} aria-hidden="true">{value === "stripe" && "✓"}</span>
          </div>
        </label>}
      </fieldset>
      <div className={styles.details} aria-live="polite">
        <div className={styles.detailHeading}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg><strong>{value === "assisted" ? "Aucun paiement à cette étape" : "Paiement à l’étape suivante"}</strong></div>
        <p>{value === "assisted" ? "Notre équipe vous contacte pour confirmer la commande et vous guider dans le règlement avant l’expédition." : "Après l’envoi de votre commande, réglez en ligne. Vos données bancaires restent chez le prestataire de paiement."}</p>
      </div>
    </div>
  </section>;
}
