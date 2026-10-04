import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import styles from "./PromoBanners.module.css";

const featured = [
  { slug: "android-tv-box-x96q", title: "Android TV Box X96Q", description: "Une nouvelle façon de profiter de votre TV.", detail: "4K Ultra HD · Android 10 · 2 Go / 16 Go" },
  { slug: "android-tv-stick-mortal-q8", title: "TV Stick Mortal Q8", description: "Vos contenus préférés, en toute simplicité.", detail: "4K Ultra HD · Android TV · Wi-Fi 5 GHz" },
];
const priceFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export default function PromoBanners({ products }: { products: Product[] }) {
  const offers = featured.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  });
  if (!offers.length) return null;
  return (
    <section className={styles.section} aria-labelledby="featured-offers-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>LA SÉLECTION ELECTROSHOP</p>
          <h2 id="featured-offers-title">Votre TV mérite mieux.</h2>
          <p>Deux essentiels pour passer à une expérience connectée.</p>
        </div>
        <div className={styles.grid}>
          {offers.map(({ product, title, description, detail }) => {
            const discount = product.originalPrice > product.currentPrice && product.originalPrice > 0
              ? Math.round((1 - product.currentPrice / product.originalPrice) * 100) : 0;
            return (
              <article key={product.id} className={styles.card}>
                <Link href={`/produits/${product.slug}`} className={styles.visual} aria-label={`Découvrir ${title}`}>
                  <span className={styles.tag}>{discount > 0 ? "Bon plan" : "À découvrir"}</span>
                  <Image src={product.image} alt={product.name} fill className={styles.image}
                    sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1023px) 40vw, 260px" />
                </Link>
                <div className={styles.content}>
                  <h3><Link href={`/produits/${product.slug}`}>{title}</Link></h3>
                  <p className={styles.description}>{description}</p>
                  <p className={styles.detail}>{detail}</p>
                  <div className={styles.pricing}>
                    <span className={styles.price}>{priceFormat.format(product.currentPrice)}</span>
                    {discount > 0 && <>
                      <del className={styles.oldPrice}>{priceFormat.format(product.originalPrice)}</del>
                      <span className={styles.discount}>−{discount}%</span>
                    </>}
                  </div>
                  <Link href={`/produits/${product.slug}`} className={styles.button}>
                    Découvrir le produit
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
