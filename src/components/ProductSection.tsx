import Link from "next/link";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import styles from "./ProductSection.module.css";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
}
export default function ProductSection({ title, subtitle, products, viewAllHref }: ProductSectionProps) {
  return (
    <section className={`below-fold ${styles.section}`}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>La sélection ElectroShop</p>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <Link href={viewAllHref} className={styles.viewAll}>Voir tout
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-6-6 6 6-6 6" /></svg>
          </Link>
        </div>
        <div className={styles.grid}>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}
