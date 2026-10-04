import Link from "next/link";
import styles from "./CategoryHighlights.module.css";

const categories = [
  {
    title: "Box TV & multimédia",
    description: "Donnez une nouvelle dimension à votre TV.",
    href: "/categorie/passerelle-multimedia",
    icon: "M3 4h18v13H3zM8 21h8M12 17v4",
  },
  {
    title: "Caméras & sécurité",
    description: "Gardez un œil sur ce qui compte.",
    href: "/categorie/camera-surveillance",
    icon: "M3 6h12v12H3zM15 10l6-4v12l-6-4M7 10h4",
  },
  {
    title: "Accessoires",
    description: "Les petits détails qui facilitent le quotidien.",
    href: "/categorie/accessoires",
    icon: "M8 3h8v18H8zM12 7h.01M11 17h2M11 11h2",
  },
];

export default function CategoryHighlights() {
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>À CHAQUE ENVIE, SA TECH</p>
            <h2 id="categories-title">Trouvez votre essentiel.</h2>
            <p className={styles.intro}>Des solutions simples pour mieux profiter de chaque jour.</p>
          </div>
          <Link href="/produits" className={styles.browse}>Toute la collection <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className={styles.card}>
              <span className={styles.icon}>
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={category.icon} />
                </svg>
              </span>
              <div className={styles.copy}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
