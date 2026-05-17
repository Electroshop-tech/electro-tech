import Link from "next/link";

const trustItems = [
  {
    title: "8 ans d'expertise",
    desc: "Spécialiste reconnu au Maroc",
    path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    title: "Livraison 24–48h",
    desc: "Partout au Maroc",
    path: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  },
  {
    title: "Service Client 7j/7",
    desc: "En magasin et en ligne",
    path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
  {
    title: "Retours sous 14 jours",
    desc: "Satisfait ou remboursé",
    path: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
  },
];

const contactInfo = [
  { text: "(+212) 716-408919", path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  { text: "contact@electroshop-tech.com", path: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { text: "Casablanca, Maroc", path: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    hoverBg: "hover:bg-[#1877F2]",
    hoverBorder: "hover:border-[#1877F2]",
    d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    hoverBg: "hover:bg-gradient-to-br",
    hoverBorder: "hover:border-pink-500",
    gradient: true,
    d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z",
  },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">{children}</h3>
      <div className="w-8 h-0.5 bg-orange-500 mt-2 rounded-full" />
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">

      {/* Trust bar */}
      <div className="bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

        {/* Brand â€” 2 cols wide */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="inline-flex items-baseline leading-none select-none">
            <span className="font-black text-[26px] text-white" style={{ letterSpacing: "-0.5px" }}>Electro</span>
            <span className="font-black text-[26px] text-orange-400" style={{ letterSpacing: "-0.5px" }}>Shop</span>
            <span className="font-light text-[13px] text-white/40 ml-0.5">-tech</span>
          </Link>

          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Votre Spécialiste marocain en box Android TV, accessoires high-tech et caméras de surveillance. Produits 100&nbsp;% authentiques, livrés rapidement partout au Maroc.
          </p>

          {/* Contact */}
          <ul className="space-y-2.5">
            {contactInfo.map((c) => (
              <li key={c.text} className="flex items-center gap-2.5 text-slate-400 text-sm">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={c.path} />
                </svg>
                {c.text}
              </li>
            ))}
          </ul>

          {/* Socials */}
          <div className="flex gap-3 pt-2">

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              style={{ background: "linear-gradient(145deg,#1a2744 0%,#1e3a6e 100%)", boxShadow: "0 2px 12px 0 rgba(24,119,242,0.18)" }}
            >
              {/* hover glow overlay */}
              <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(145deg,#1877F2 0%,#42a5f5 100%)", boxShadow: "0 6px 20px 0 rgba(24,119,242,0.45)" }} />
              <svg className="relative w-5 h-5 text-[#90baf9] group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              style={{ background: "linear-gradient(145deg,#3a1a2e 0%,#4a1942 100%)", boxShadow: "0 2px 12px 0 rgba(225,48,108,0.18)" }}
            >
              <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)", boxShadow: "0 6px 20px 0 rgba(220,39,67,0.45)" }} />
              <svg className="relative w-5 h-5 text-pink-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

          </div>
        </div>

        {/* Catégories */}
        <div>
          <FooterHeading>Catégories</FooterHeading>
          <ul className="space-y-2.5">
            {[
              { href: "/categorie/passerelle-multimedia", label: "Box Android TV" },
              { href: "/categorie/passerelle-multimedia", label: "TV Stick" },
              { href: "/categorie/camera-surveillance", label: "Caméras de Surveillance" },
              { href: "/categorie/accessoires", label: "Accessoires" },
              { href: "/produits", label: "Chargeurs & Câbles" },
              { href: "/promotions", label: "Offres & Promotions" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-orange-400 flex-shrink-0 transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service client */}
        <div>
          <FooterHeading>Service Client</FooterHeading>
          <ul className="space-y-2.5">
            {[
              { href: "/livraison", label: "Livraison & Délais" },
              { href: "/retours", label: "Retours & Remboursements" },
              { href: "/garanties", label: "Nos Garanties" },
              { href: "/suivi-commande", label: "Suivi de Commande" },
              { href: "/faq", label: "FAQ" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-orange-400 flex-shrink-0 transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Informations */}
        <div>
          <FooterHeading>Informations</FooterHeading>
          <ul className="space-y-2.5">
            {[
              { href: "/a-propos", label: "Qui sommes-nous ?" },
              { href: "/contact", label: "Contactez-nous" },
              { href: "/magasin", label: "Notre Magasin" },
              { href: "/cgv", label: "Conditions de vente" },
              { href: "/confidentialite", label: "Confidentialité" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-orange-400 flex-shrink-0 transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear}{" "}
            <span className="text-slate-400 font-semibold">ElectroShop-Tech.ma</span>{" "}
            SARL &mdash; Tous droits réservés
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs">Paiement sécurisé :</span>
            <div className="flex items-center gap-1.5">

              {/* Visa */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 flex items-center justify-center shadow-sm border border-slate-100" title="Visa">
                <svg viewBox="0 0 60 20" className="h-3.5 w-auto" aria-label="Visa">
                  <text x="1" y="17" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="20" fill="#1A1F71" fontStyle="italic" letterSpacing="-0.5">VISA</text>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="bg-white rounded-lg px-2.5 py-1.5 h-8 flex items-center justify-center shadow-sm border border-slate-100" title="Mastercard">
                <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-label="Mastercard">
                  <circle cx="13" cy="11" r="10" fill="#EB001B"/>
                  <circle cx="23" cy="11" r="10" fill="#F79E1B"/>
                  <path d="M18 3.5a10 10 0 0 1 0 15A10 10 0 0 1 18 3.5z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* CMI */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 flex items-center justify-center shadow-sm border border-slate-100" title="CMI – Centre Monétique Interbancaire">
                <svg viewBox="0 0 42 16" className="h-3.5 w-auto" aria-label="CMI">
                  <rect x="0" y="0" width="42" height="16" rx="2" fill="#005BAC"/>
                  <text x="21" y="12" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="11" fill="white" textAnchor="middle" letterSpacing="1.5">CMI</text>
                </svg>
              </div>

              {/* Virement bancaire */}
              <div className="bg-white rounded-lg px-2.5 py-1.5 h-8 flex items-center justify-center gap-1 shadow-sm border border-slate-100" title="Virement bancaire">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10h20"/>
                </svg>
                <span className="text-[10px] font-bold text-slate-500 leading-none">Virement</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


