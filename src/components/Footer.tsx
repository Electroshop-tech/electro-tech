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
    <footer className="bg-[#070b14] text-slate-300">

      {/* Trust bar */}
      <div className="bg-[#0b1220] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item, i) => (
            <div key={item.title} data-reveal="up" data-reveal-delay={String(i * 70)} className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs sm:text-sm font-bold leading-tight">{item.title}</p>
                <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-7 sm:gap-10">

        {/* Brand — 2 cols wide on desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-baseline leading-none select-none">
            <span className="font-black text-[26px] text-white" style={{ letterSpacing: "-0.5px" }}>Electro</span>
            <span className="font-black text-[26px] text-orange-400" style={{ letterSpacing: "-0.5px" }}>Shop</span>
            <span className="font-light text-[13px] text-white/40 ml-0.5">-tech</span>
          </Link>

          <p className="hidden sm:block text-slate-400 text-sm leading-relaxed max-w-xs">
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

        </div>

        {/* Nav columns — 2×2 grid on mobile, 3 separate cols on sm+ */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:contents">

        {/* Catégories */}
        <div>
          <FooterHeading>Catégories</FooterHeading>
          <ul className="space-y-2.5">
            {[
              { href: "/categorie/passerelle-multimedia", label: "Box Android TV" },
              { href: "/categorie/passerelle-multimedia#tv-stick", label: "TV Stick" },
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
        {/* Informations — spans both cols on mobile so it sits below the 2×2 */}
        <div className="col-span-2 sm:col-auto">
          <FooterHeading>Informations</FooterHeading>
          <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2.5">
            {[
              { href: "/a-propos", label: "Qui sommes-nous ?" },
              { href: "/contact", label: "Contactez-nous" },
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

        </div>{/* end nav wrapper */}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            &copy; {currentYear}{" "}
            <span className="text-slate-400 font-semibold">ElectroShop-Tech</span>{" "}
            SARL &mdash; Tous droits réservés
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* SSL badge */}
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px]" title="Site sécurisé SSL">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span className="font-semibold text-emerald-500/80">SSL Sécurisé</span>
            </div>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 text-[10px] sm:text-xs shrink-0">Paiement sécurisé :</span>
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


