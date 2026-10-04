"use client";

import { useState, type MouseEvent } from "react";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import styles from "./AddToCartWidget.module.css";

type CartProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  slug: string;
};

export default function AddToCartWidget({ product, variant = "light" }: { product: CartProduct; variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { toggle: toggleWishlist, isWished } = useWishlist();
  const wishlist = isWished(product.slug);
  const { addToCart } = useCart();

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    addToCart({ ...product, image: decodeURIComponent(product.image) }, qty, event.currentTarget);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={`${styles.widget} ${dark ? styles.dark : ""}`}>
      {/* Quantity */}
      <div className={styles.quantityRow}>
        <div className={styles.quantityGroup}>
        <span className={styles.label}>Quantité</span>
        <div className={styles.stepper}>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Réduire la quantité"
            disabled={qty === 1}
            className={styles.step}
          >
            −
          </button>
          <span aria-live="polite" className={styles.quantity}>{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Augmenter la quantité"
            className={styles.step}
          >
            +
          </button>
        </div>
        </div>
        <div className={styles.total}><span>Total</span><strong aria-live="polite">{(product.price * qty).toLocaleString("fr-FR")} €</strong></div>
      </div>

      {/* Add to cart + wishlist */}
      <div className={styles.actions}>
        <button
          onClick={handleAdd}
          className={`${styles.add} ${added ? styles.added : ""}`}
        >
          <span className={styles.buttonContent} aria-live="polite">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3h2l3 12h11l2-9H6M9 20h.01M18 20h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {added ? "Ajouté, merci !" : "Ajouter au panier"}
          </span>
        </button>
        <button
          onClick={() => toggleWishlist(product.slug)}
          title={wishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-label={wishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={wishlist}
          className={`${styles.wishlist} ${wishlist ? styles.wished : ""}`}
        >
          <svg className="w-5 h-5" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{wishlist ? "Enregistré" : "Enregistrer"}</span>
        </button>
      </div>
    </div>
  );
}
