import Link from "next/link";
import type { Product } from "@/lib/types";
import AddToCartWidget from "./AddToCartWidget";
import BackInStockButton from "./BackInStockButton";
import ProductGallery from "./ProductGallery";
import styles from "./ProductDetailPremium.module.css";

export default function ProductDetail({ product, images, category, rating, reviewCount }: {
  product: Product; images: string[]; category: string; rating: number | null; reviewCount: number;
}) {
  const inStock = product.inStock !== false;
  const saving = Math.max(0, product.originalPrice - product.currentPrice);
  const discount = product.originalPrice > 0 ? Math.round(saving / product.originalPrice * 100) : 0;
  const specs = (product.specs?.filter(Boolean).length ? product.specs : product.description.split(/[,\n]/).map(s => s.trim()).filter(Boolean)) ?? [];
  const price = (value: number) => value.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 });

  return (
    <section className={styles.layout} aria-label="Détails du produit">
      <div className={styles.visual}>
        <ProductGallery images={[...images, product.image]} name={product.name} discount={discount} badge={product.badge} isRefurbished={product.isRefurbished} />
        <div className={styles.galleryCaption}><span>TECHNOLOGIE AU QUOTIDIEN</span><span>ElectroShop<span className={styles.orange}>-Tech</span></span></div>
      </div>

      <div className={styles.details}>
        <header className={styles.heading}>
        <div className={styles.eyebrow}><Link href={`/categorie/${product.category}`}>{category}</Link>{product.brand && <><span>/</span><span>{product.brand}</span></>}</div>
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.meta}>
          <span className={`${styles.stock} ${!inStock ? styles.unavailable : ""}`}><span />{inStock ? "En stock" : "Indisponible"}</span>
          {rating !== null && <a href="#product-reviews" className={styles.rating}><span>★</span> {rating.toLocaleString("fr-FR")} <span className={styles.reviewCount}>({reviewCount} avis)</span></a>}
          {product.sku && <span className={styles.reference}>Réf. {product.sku}</span>}
        </div>

        </header>
        <div className={styles.purchase}>
          <div className={styles.priceRow}>
            <div><span className={styles.priceLabel}>Prix du produit</span><div className={styles.price}>{price(product.currentPrice)}{saving > 0 && <del>{price(product.originalPrice)}</del>}</div></div>
            {saving > 0 && <span className={styles.saving}><strong>−{discount}%</strong><span>Vous économisez {price(saving)}</span></span>}
          </div>
          <div className={styles.cart}>
            {inStock ? <AddToCartWidget product={{ id: product.id, name: product.name, brand: product.brand, price: product.currentPrice, originalPrice: product.originalPrice, image: product.image, slug: product.slug }} /> : <BackInStockButton slug={product.slug} />}
          </div>
          <div className={styles.help}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3M6 10h12v11H6z" /></svg>Commande sécurisée<span>•</span><Link href="/contact">Une question ?</Link></div>
        </div>

        <div className={styles.assurances}>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg><span><small>État</small><strong>{product.condition || (product.isRefurbished ? "Occasion" : "Produit neuf")}</strong></span></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><span><small>Garantie</small><strong>{product.guarantee || "12 mois"}</strong></span></div>
          <Link href="/livraison"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 5h11v12H3zM14 9h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg><span><small>Livraison</small><strong>Suivi de commande</strong></span></Link>
        </div>

        {specs.length > 0 && <div className={styles.features}><h2>L’essentiel, en un coup d’œil</h2><ul>{specs.slice(0, 4).map((spec, i) => <li key={i}><span aria-hidden="true">✓</span>{spec}</li>)}</ul></div>}
        <Link href={`/categorie/${product.category}`} className={styles.explore}>Découvrir les {category.toLocaleLowerCase("fr-FR")} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
