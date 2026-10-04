"use client";

import { useEffect } from "react";
import Link from "next/link";
import { flyProductToCart } from "@/lib/cart-animation";
import styles from "./CartFeedback.module.css";

export interface CartNotice {
  id: number;
  name: string;
  image: string;
  origin?: HTMLElement | null;
}

export default function CartFeedback({ notice, onDismiss }: { notice: CartNotice | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!notice) return;
    let cleanup = () => {};
    const frame = requestAnimationFrame(() => {
      cleanup = flyProductToCart(notice.image, notice.name, notice.origin);
    });
    return () => { cancelAnimationFrame(frame); cleanup(); };
  }, [notice]);

  return (
    <div className={notice ? styles.toast : undefined}>
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.message}>
        {notice && <>
          <span className={styles.check} aria-hidden="true">✓</span>
          <div><strong>Merci ! Produit ajouté au panier.</strong><p>{notice.name}</p></div>
        </>}
      </div>
      {notice && <>
        <Link href="/panier" className={styles.cart} data-cart-target aria-label="Voir mon panier" onClick={onDismiss}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 3h2l2.5 13h10l3-9H6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" />
          </svg>
        </Link>
        <button type="button" onClick={onDismiss} className={styles.close} aria-label="Fermer la confirmation">×</button>
      </>}
    </div>
  );
}
