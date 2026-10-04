import Link from "next/link";
import styles from "./MobileMenu.module.css";

const categories = [
  { slug: "passerelle-multimedia", label: "Box & TV Stick", icon: "M3 4h18v13H3zM8 21h8M12 17v4" },
  { slug: "accessoires", label: "Accessoires", icon: "M8 3h8v18H8zM12 7h.01M11 11h2M11 17h2" },
  { slug: "camera-surveillance", label: "Caméras", icon: "M3 6h12v12H3zM15 10l6-4v12l-6-4" },
];
const groups = [
  {
    title: "La boutique",
    links: [
      { href: "/produits", label: "Tous les produits", icon: "M12 3l9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9" },
      { href: "/promotions", label: "Promotions", icon: "M3 3h9l9 9-9 9-9-9V3ZM7 7h.01" },
      { href: "/nouveautes", label: "Nouveautés", icon: "m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" },
    ],
  },
  {
    title: "Vos raccourcis",
    links: [
      { href: "/suivi-commande", label: "Suivre ma commande", icon: "M8 5H5v16h14V5h-3M8 3h8v4H8zM9 12h6M9 16h4" },
      { href: "/favoris", label: "Mes favoris", icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" },
      { href: "/contact", label: "Nous contacter", icon: "M3 5h18v14H3zM3 5l9 8 9-8" },
    ],
  },
];

function Icon({ path }: { path: string }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

export default function MobileMenu({ user, pathname, onClose }: {
  user: { firstName: string; lastName: string } | null;
  pathname: string;
  onClose: () => void;
}) {
  return (
    <nav id="mobile-navigation" aria-label="Navigation mobile" className={styles.menu}>
      <div className={styles.account}>
        <span className={styles.avatar}><Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></span>
        <div className={styles.accountCopy}>
          <p>{user ? `Bonjour, ${user.firstName}` : "Votre espace"}</p>
          <span>Commandes et favoris</span>
        </div>
        <Link href="/compte" onClick={onClose} className={styles.login}>{user ? "Mon compte" : "Connexion"}<span aria-hidden="true">↗</span></Link>
      </div>

      <div className={styles.categories}>
        <p className={styles.label}>Explorer par catégorie</p>
        <div className={styles.categoryGrid}>
          {categories.map((category) => {
            const href = `/categorie/${category.slug}`;
            return <Link key={href} href={href} onClick={onClose} className={styles.category} aria-current={pathname === href ? "page" : undefined}>
              <span><Icon path={category.icon} /></span>
              {category.label}
            </Link>;
          })}
        </div>
      </div>

      {groups.map((group) => <div key={group.title} className={styles.group}>
        <p className={styles.label}>{group.title}</p>
        {group.links.map((link) => <Link key={link.href} href={link.href} onClick={onClose} className={styles.link} aria-current={pathname === link.href ? "page" : undefined}>
          <Icon path={link.icon} />
          <span>{link.label}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>)}
      </div>)}

      <a href="tel:+212716408919" className={styles.help}>
        <Icon path="M3 5a2 2 0 0 1 2-2h3l2 5-3 2a11 11 0 0 0 7 7l2-3 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5Z" />
        <span>Besoin d’un conseil ?<strong>(+212) 716-408919</strong></span>
        <span className={styles.call}>Appeler ↗</span>
      </a>
    </nav>
  );
}
