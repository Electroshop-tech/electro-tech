"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/data";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setAuthUser(d.user ?? null)).catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar - hidden on mobile */}
      <div className="hidden sm:block bg-blue-950 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:underline">Contactez-Nous</Link>
            <span className="opacity-40">|</span>
            <Link href="/services" className="hover:underline">Nos Services</Link>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>(+212) 716-408919</span>
            <span className="opacity-40">|</span>
            <Link href="/magasin" className="hover:underline">Magasin</Link>
            <Link href="/compte" className="hover:opacity-80 flex items-center gap-1">
              {authUser ? (
                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {authUser.firstName[0]}{authUser.lastName[0]}
                </span>
              ) : (
                <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-5">
          {/* Logo */}
          <style>{`
            @keyframes logoShimmer {
              0%   { background-position: -250% center; }
              100% { background-position: 250% center; }
            }
            @keyframes shopFlame {
              0%   { background-position: 0% 100%; }
              50%  { background-position: 100% 0%; }
              100% { background-position: 0% 100%; }
            }
            @keyframes shopGlow {
              0%,100% { filter: drop-shadow(0 0 4px rgba(251,146,60,0.5)) drop-shadow(0 0 10px rgba(251,146,60,0.2)) brightness(1); }
              30%     { filter: drop-shadow(0 0 10px rgba(251,146,60,1)) drop-shadow(0 0 22px rgba(251,146,60,0.7)) drop-shadow(0 0 40px rgba(251,146,60,0.35)) brightness(1.35); }
              60%     { filter: drop-shadow(0 0 8px rgba(250,204,21,0.9)) drop-shadow(0 0 18px rgba(251,146,60,0.8)) drop-shadow(0 0 34px rgba(249,115,22,0.3)) brightness(1.2); }
            }
            @keyframes shopScale {
              0%,100% { transform: scale(1) translateY(0); }
              50%     { transform: scale(1.06) translateY(-1px); }
            }
            @keyframes taglineReveal {
              from { opacity:0; letter-spacing:0.08em; transform:translateY(5px); }
              to   { opacity:1; letter-spacing:0.22em; transform:translateY(0); }
            }
            @keyframes techFade {
              from { opacity:0; transform:translateX(-4px); }
              to   { opacity:0.55; transform:translateX(0); }
            }
            @keyframes dotSpark {
              0%,100% { opacity:0.3; transform:scale(1); }
              50%     { opacity:1;   transform:scale(1.6); }
            }
            @keyframes dropdownEnter {
              from { opacity:0; transform:translateY(-10px) scale(0.96); filter:blur(2px); }
              to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0);  }
            }
            @keyframes rowSlideIn {
              from { opacity:0; transform:translateX(-14px); }
              to   { opacity:1; transform:translateX(0); }
            }
            @keyframes footerFadeUp {
              from { opacity:0; transform:translateY(6px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>
          <Link href="/" className="flex-shrink-0 select-none" style={{ textDecoration: 'none' }}>
            <div className="leading-none">
              {/* Main wordmark row */}
              <div className="flex items-baseline" style={{ lineHeight: 1 }}>
                {/* Electro — shimmer sweep */}
                <span
                  className="font-black text-[26px]"
                  style={{
                    background: 'linear-gradient(90deg, #e2eeff 0%, #ffffff 30%, #b8d4ff 50%, #ffffff 70%, #e2eeff 100%)',
                    backgroundSize: '250% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'logoShimmer 4s linear infinite',
                    letterSpacing: '-0.5px',
                  }}
                >Electro</span>
                {/* Shop — static orange */}
                <span
                  className="font-black text-[26px] text-orange-400"
                  style={{ letterSpacing: '-0.5px' }}
                >Shop</span>
                {/* -tech suffix */}
                <span
                  className="font-light text-[13px] text-white ml-0.5"
                  style={{
                    transform: 'translateY(-3px)',
                    display: 'inline-block',
                    animation: 'techFade 0.8s ease-out 0.6s both',
                    opacity: 0.55,
                    letterSpacing: '0.03em',
                  }}
                >-tech</span>
              </div>
              {/* Tagline */}
              <div
                className="text-white text-[8px] font-bold uppercase mt-[3px] flex items-center gap-1"
                style={{ animation: 'taglineReveal 0.9s ease-out 0.2s both', opacity: 0 }}
              >
                <span style={{ animation: 'dotSpark 2s ease-in-out 1.2s infinite' }} className="w-[3px] h-[3px] rounded-full bg-orange-400 inline-block" />
                <span className="text-white/50 tracking-[0.22em]">Technologie · Multimédia · Performance</span>
                <span style={{ animation: 'dotSpark 2s ease-in-out 1.6s infinite' }} className="w-[3px] h-[3px] rounded-full bg-orange-400 inline-block" />
              </div>
            </div>
          </Link>

          {/* Search bar - hidden on mobile, dedicated row below */}
          <form
            className="flex-1 hidden sm:flex items-center bg-white rounded-full overflow-hidden shadow-sm ring-2 ring-transparent focus-within:ring-orange-400/60 transition-all duration-200"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Category selector */}
            <div className="hidden lg:flex items-center relative border-r border-gray-200 flex-shrink-0">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="pl-4 pr-7 py-2.5 text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer appearance-none max-w-[130px]"
              >
                <option value="">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <svg className="absolute right-2 w-3 h-3 text-slate-400 pointer-events-none flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des produits, marques…"
              className="flex-1 px-5 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white pl-5 pr-6 py-2.5 transition-colors flex-shrink-0 flex items-center gap-2"
              aria-label="Rechercher"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="hidden lg:block text-sm font-semibold">Rechercher</span>
            </button>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto sm:ml-0">
            {/* Account */}
            <Link
              href="/compte"
              className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              <span className="text-[10px] font-medium">Compte</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/favoris"
              className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
              <span className="text-[10px] font-medium">Favoris</span>
            </Link>

            {/* Compare */}
            <Link
              href="/comparer"
              className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
              </svg>
              <span className="text-[10px] font-medium">Comparer</span>
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/20 mx-1" />

            {/* Cart */}
            <Link
              href="/panier"
              className="flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              <div className="relative flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-500 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block leading-none">
                <div className="text-[10px] opacity-80 font-medium">Mon Panier</div>
                <div className="text-sm font-bold">0,00 €</div>
              </div>
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white ml-1 p-1"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="sm:hidden bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-3 pb-3">
        <form className="flex items-center bg-white rounded-full overflow-hidden shadow-sm" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 pl-4 pr-2 py-2.5 text-sm outline-none text-slate-800 placeholder-slate-400"
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 flex items-center transition-colors flex-shrink-0" aria-label="Rechercher">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Navigation bar */}
      <nav className="bg-white border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center text-sm font-medium">

            {/* Mega menu trigger */}
            <li
              className="relative self-stretch flex items-stretch border-r border-gray-100"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className="flex items-center gap-2 px-5 py-3.5 text-white bg-orange-500 hover:bg-orange-600 transition-colors font-bold group whitespace-nowrap">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Toutes Les Catégories
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:rotate-180"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {isMegaMenuOpen && (
                <div className="absolute left-0 top-full bg-white z-50 rounded-b-2xl overflow-hidden"
                  style={{ width: "26rem", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.18), 0 4px 20px -4px rgba(0,0,0,0.10)", animation: "dropdownEnter 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
                >
                  {/* Header */}
                  <div className="px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h10M4 18h7" />
                      </svg>
                    </div>
                    <span className="text-white text-[11px] font-black tracking-[0.15em] uppercase">Nos Catégories</span>
                    <span className="ml-auto text-[10px] text-white/35 font-medium">3 catégories</span>
                  </div>

                  {/* Category rows */}
                  {[
                    {
                      slug: "passerelle-multimedia",
                      name: "Passerelle Multimédia",
                      desc: "Box TV, TV Sticks, Android TV",
                      count: 3,
                      badgeClass: "bg-orange-500 text-white",
                      img: "/Categories images/passerelle multimedia.png",
                    },
                    {
                      slug: "accessoires",
                      name: "Accessoires",
                      desc: "Télécommandes, câbles, supports",
                      count: 1,
                      badgeClass: "bg-blue-500 text-white",
                      img: "/Categories images/accessoires.png",
                    },
                    {
                      slug: "camera-surveillance",
                      name: "Caméra de Surveillance",
                      desc: "Caméras IP, DVR, kits sécurité",
                      count: 0,
                      badgeClass: "bg-slate-200 text-slate-500",
                      img: "/Categories images/camera de surveillance.png",
                    },
                  ].map((cat, i) => (
                    <Link
                      key={cat.slug}
                      href={`/categorie/${cat.slug}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-transparent transition-all group/item border-b border-gray-100/70 last:border-0 border-l-[3px] border-l-transparent hover:border-l-orange-500"
                      style={{ animation: `rowSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) ${i * 65 + 60}ms both` }}
                    >
                      {/* Image tile */}
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border border-gray-100 transition-all duration-200 group-hover/item:shadow-lg group-hover/item:scale-105 overflow-hidden">
                        <Image
                          src={cat.img}
                          alt={cat.name}
                          width={44}
                          height={44}
                          className="object-contain w-10 h-10"
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[13.5px] text-slate-800 group-hover/item:text-orange-600 transition-colors leading-snug">
                          {cat.name}
                        </div>
                        <div className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">{cat.desc}</div>
                      </div>

                      {/* Right side */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full leading-none ${cat.badgeClass}`}>
                          {cat.count > 0 ? `${cat.count} produits` : "Bientôt"}
                        </span>
                        <svg
                          className="w-3.5 h-3.5 text-orange-400 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-0.5"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}

                  {/* Footer CTA */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-orange-50/40 border-t border-gray-100" style={{ animation: "footerFadeUp 0.3s cubic-bezier(0.16,1,0.3,1) 260ms both" }}>
                    <Link
                      href="/produits"
                      className="flex items-center gap-2.5 group/footer"
                    >
                      <div className="w-7 h-7 bg-orange-500 group-hover/footer:bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-bold text-slate-700 group-hover/footer:text-orange-600 transition-colors">
                        Voir tous les produits
                      </span>
                      <svg
                        className="w-3.5 h-3.5 ml-auto text-orange-400 transition-transform group-hover/footer:translate-x-1"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {[
              { href: "/categorie/passerelle-multimedia", label: "Passerelle Multimédia", promo: false },
              { href: "/categorie/accessoires", label: "Accessoires", promo: false },
              { href: "/categorie/camera-surveillance", label: "Caméra de Surveillance", promo: false },
              { href: "/contact", label: "Contact", promo: false },
            ].map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href} className="self-stretch flex items-stretch">
                  <Link
                    href={link.href}
                    className={`
                      relative flex items-center px-5 py-3.5 font-semibold transition-colors whitespace-nowrap
                      after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full
                      after:bg-orange-500 after:transition-all after:duration-200
                      ${isActive
                        ? "text-orange-500 after:opacity-100"
                        : link.promo
                          ? "text-orange-500 hover:text-orange-600 after:opacity-0 hover:after:opacity-100"
                          : "text-slate-700 hover:text-orange-500 after:opacity-0 hover:after:opacity-100"
                      }
                    `}
                  >
                    {link.promo && (
                      <span className="mr-1.5 text-base leading-none">🔥</span>
                    )}
                    {link.label}
                    {link.promo && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[9px] font-black tracking-wide bg-red-500 text-white rounded-full leading-none animate-pulse">
                        PROMO
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          {/* Account banner */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 px-4 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-white font-bold text-sm">Mon Espace</p>
              <p className="text-white/50 text-xs mt-0.5">
                {authUser ? `Bonjour, ${authUser.firstName}` : "Connectez-vous à votre compte"}
              </p>
            </div>
            <Link
              href="/compte"
              onClick={() => setIsMenuOpen(false)}
              className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
            >
              {authUser ? `${authUser.firstName[0]}${authUser.lastName[0]}` : "Se connecter"}
            </Link>
          </div>

          {/* Categories */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Catégories</p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorie/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors group"
                >
                  <span className="text-xl w-8 text-center">{cat.icon}</span>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-500 transition-colors flex-1">{cat.name}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links grid */}
          <div className="px-4 pt-3 pb-4 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pt-1">Liens rapides</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/produits", label: "Tous les produits", icon: "🛍️" },
                { href: "/promotions", label: "Promotions", icon: "🔥" },
                { href: "/contact", label: "Contact", icon: "💬" },
                { href: "/magasin", label: "Notre magasin", icon: "🏪" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-3 rounded-xl bg-gray-50 hover:bg-orange-50 active:bg-orange-100 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="leading-tight text-xs">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex items-center gap-3">
            <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs font-semibold text-gray-600">(+212) 716-408919</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-400">Lun–Sam 9h–19h</span>
          </div>
        </div>
      )}
    </header>
  );
}
