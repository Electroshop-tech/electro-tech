"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { Product } from "@/lib/types";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";
import styles from "./ProductCard.module.css";

const priceFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
function CardNavPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className={styles.pending} aria-hidden="true"><span /></span> : null;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toggle: toggleWishlist, isWished } = useWishlist();
  const { addToCart } = useCart();
  const wishlist = isWished(product.slug);
  const discount = product.originalPrice > product.currentPrice && product.originalPrice > 0
    ? Math.round((1 - product.currentPrice / product.originalPrice) * 100) : 0;
  const reviews = product.productReviews?.filter((r) => r.approved !== false) ?? [];
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const lowStock = product.inStock !== false && typeof product.stockQuantity === "number" && product.stockQuantity > 0 && product.stockQuantity <= 5;

  function handleAdd() {
    addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.currentPrice,
      originalPrice: product.originalPrice, image: product.image, slug: product.slug }, 1, imageRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleCompare() {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem("compare-list") ?? "[]");
      const saved = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
      if (!saved.includes(product.slug) && saved.length < 3) {
        localStorage.setItem("compare-list", JSON.stringify([...saved, product.slug]));
      }
    } catch {
      localStorage.setItem("compare-list", JSON.stringify([product.slug]));
    }
    router.push("/comparer");
  }

  return (
    <article className={styles.card}>
      <div className={styles.visual}>
        <Link href={`/produits/${product.slug}`} className={styles.imageLink} aria-label={`Découvrir ${product.name}`}>
          <Image ref={imageRef} src={product.image} alt={product.name} fill className={styles.image}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw" />
          <CardNavPending />
        </Link>
        <div className={styles.badges}>
          {discount > 0 && <span className={styles.discount}>−{discount}%</span>}
          {product.badge === "Nouveau" && <span className={styles.badge}>Nouveau</span>}
          {product.isRefurbished && <span className={styles.badge}>Occasion</span>}
        </div>
        <button type="button" className={`${styles.wishlist} ${wishlist ? styles.wished : ""}`}
          onClick={() => toggleWishlist(product.slug)} aria-pressed={wishlist}
          aria-label={wishlist ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}>
          <svg width="18" height="18" fill={wishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <p className={styles.brand}>{product.brand}</p>
          {rating !== null && <div className={styles.rating} aria-label={`${rating.toFixed(1).replace(".", ",")} sur 5, ${reviews.length} avis`}><span className={styles.star} aria-hidden="true">★</span><span>{rating.toFixed(1).replace(".", ",")}</span><span className={styles.reviewCount}>({reviews.length})</span></div>}
        </div>
        <Link href={`/produits/${product.slug}`} className={styles.title}><h3>{product.name}</h3></Link>
        <div className={styles.priceRow}>
          <span className={styles.price}>{priceFormat.format(product.currentPrice)} <span>€</span></span>
          {discount > 0 && <span className={styles.oldPrice}>{priceFormat.format(product.originalPrice)} €</span>}
        </div>
        <p className={`${styles.stock} ${lowStock ? styles.lowStock : ""} ${product.inStock === false ? styles.onOrder : ""}`}>
          <span aria-hidden="true" />{product.inStock === false ? "Sur commande" : lowStock ? `Plus que ${product.stockQuantity} en stock` : "En stock"}
        </p>
        <button type="button" onClick={handleAdd} className={`${styles.add} ${added ? styles.added : ""}`} aria-label={`Ajouter ${product.name} au panier`}>
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            {added ? <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l2.5 13h10l3-9H6M9 7V3m-2 2h4" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>}
          </svg>
          <span aria-live="polite">{added ? "Ajouté !" : <>Ajouter<span className={styles.cartLabel}> au panier</span></>}</span>
        </button>
        <div className={styles.utilities}>
          <button type="button" onClick={handleCompare}>Comparer</button>
          <a href={`https://wa.me/212716408919?text=${encodeURIComponent(`Bonjour, je suis intéressé par ${product.name}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`Poser une question sur ${product.name} via WhatsApp`}>Une question ?</a>
        </div>
      </div>
    </article>
  );
}
