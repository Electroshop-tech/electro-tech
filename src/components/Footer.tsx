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

          {/* Social links */}
          <div className="flex items-center gap-3 pt-1">
            <a href="https://www.facebook.com/electroshoptech" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center transition-colors group" aria-label="Facebook">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/electroshoptech" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] flex items-center justify-center transition-all group" aria-label="Instagram">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@electroshoptech" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-black flex items-center justify-center transition-colors group" aria-label="TikTok">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43v-7.15a8.16 8.16 0 005.58 2.17V11.3a4.85 4.85 0 01-3.77-1.85V6.69h3.77z"/></svg>
            </a>
            <a href="https://wa.me/212716408919" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#25D366] flex items-center justify-center transition-colors group" aria-label="WhatsApp">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

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


