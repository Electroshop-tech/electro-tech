import Image from "next/image";
import Link from "next/link";
import styles from "./HeroBanner.module.css";

function Arrow() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.main}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>L’ESSENTIEL HIGH-TECH</p>
          <h1 id="hero-title">La tech,<br /><span>tout simplement.</span></h1>
          <p className={styles.description}>
            Box TV, caméras et accessoires.<br />
            Tout pour un quotidien connecté.
          </p>
          <div className={styles.actions}>
            <Link href="/produits" className={styles.primary}><span className={styles.desktopCopy}>Découvrir la boutique</span><span className={styles.mobileCopy}>La boutique</span> <Arrow /></Link>
            <Link href="/promotions" className={styles.secondary}>Voir les offres <Arrow /></Link>
          </div>
        </div>
        <div className={styles.photo}>
          <Image
            src="/images/ecommerce-hero-photo.png"
            alt="Collection de box Android TV, stick Mortal et télécommandes sur un présentoir éclairé en bleu et orange"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
      <div className={styles.benefits}>
        <div className={styles.benefitsInner}>
          <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 5h11v13H3zM14 10h4l3 4v4h-7" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg><span><strong>Livraison à domicile</strong><span>Directement chez vous</span></span></p>
          <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg><span><strong>Paiement accompagné</strong><span>Notre équipe vous aide</span></span></p>
          <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg><span><strong>Produits authentiques</strong><span>La qualité au rendez-vous</span></span></p>
        </div>
      </div>
    </section>
  );
}
