import Image from "next/image";
import type { CartItem } from "@/lib/cartContext";
import styles from "./Checkout.module.css";

export default function CheckoutSummary({ items, subtotal, deliveryFee, total, promo }: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  promo: { code: string; label: string; discount: number } | null;
}) {
  return <>
    <ul className={styles.summaryItems} aria-label="Articles de votre commande">
      {items.map(item => <li key={item.id} className={styles.summaryItem}>
        <div className={styles.productImage}>
          <Image src={item.image} alt={item.name} width={64} height={64} sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={styles.productName}>{item.name}</p>
          <p className={styles.productBrand}>{item.brand && <>{item.brand} · </>}Quantité : {item.qty}</p>
        </div>
        <p className={styles.productPrice}>{(item.price * item.qty).toLocaleString("fr-FR")} €</p>
      </li>)}
    </ul>
    <dl className={styles.summaryTotals}>
      <div><dt>Sous-total</dt><dd>{subtotal.toLocaleString("fr-FR")} €</dd></div>
      {promo && <div className={styles.discountRow}>
        <dt>Réduction <span>{promo.code}</span></dt><dd>−{promo.discount.toLocaleString("fr-FR")} €</dd>
      </div>}
      <div><dt>Livraison</dt><dd className={deliveryFee <= 0 ? styles.free : undefined}>{deliveryFee > 0 ? `${deliveryFee.toLocaleString("fr-FR")} €` : "Gratuite"}</dd></div>
      <div className={styles.totalRow}><dt>Total TTC</dt><dd>{total.toLocaleString("fr-FR")} <span>€</span></dd></div>
    </dl>
    <p className={styles.summaryFootnote}>Taxes comprises{deliveryFee <= 0 ? " · Livraison gratuite" : " · Livraison incluse"}</p>
  </>;
}
