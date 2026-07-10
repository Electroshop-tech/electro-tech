"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { categories } from "@/lib/data";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";

const TICKER_MESSAGES = [
  { icon: "🚚", text: "Livraison 24–48h partout au Maroc", color: "text-emerald-400" },
  { icon: "🔄", text: "Retour gratuit sous 14 jours — Satisfait ou remboursé", color: "text-sky-400" },
  { icon: "✅", text: "Produits 100 % authentiques & garantis", color: "text-orange-400" },
  { icon: "⚡", text: "Ventes flash en cours — Profitez des prix exclusifs !", color: "text-yellow-400" },
];

function TickerMessage() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TICKER_MESSAGES.length);
        setVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const msg = TICKER_MESSAGES[idx];
  return (
    <span
      className={`flex items-center gap-2 text-[11.5px] font-semibold transition-all duration-350 ${msg.color} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
      style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
    >
      <span>{msg.icon}</span>
      {msg.text}
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { cartCount, cartTotal } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setAuthUser(d.user ?? null)).catch(() => {});
  }, [pathname]);

  // Live search debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setSuggestions([]); setSuggestionsOpen(false); return; }
    setSuggestionsLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setSuggestionsOpen(true);
      } catch { setSuggestions([]); }
      finally { setSuggestionsLoading(false); }
    }, 220);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktop = searchRef.current?.contains(e.target as Node);
      const inMobile = mobileSearchRef.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) { setSuggestionsOpen(false); setSelectedIdx(-1); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSuggestKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestionsOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, Math.min(suggestions.length, 6) - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      const p = suggestions[selectedIdx];
      if (p) { setSuggestionsOpen(false); setSearchQuery(""); setSelectedIdx(-1); router.push(`/produits/${p.slug}`); }
    } else if (e.key === "Escape") { setSuggestionsOpen(false); setSelectedIdx(-1); }
  };

  const [headerHidden, setHeaderHidden] = useState(false);
  const headerScrollY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        headerScrollY.current = y;
        setHeaderHidden(false);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Close menu on any scroll (including inside the menu panel itself)
  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    document.addEventListener("touchmove", close, { passive: true });
    document.addEventListener("wheel", close, { passive: true });
    return () => {
      document.removeEventListener("touchmove", close);
      document.removeEventListener("wheel", close);
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const params = new URLSearchParams({ q });
    if (searchCategory) params.set("cat", searchCategory);
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <header className={`sticky top-0 z-50 isolate bg-[#162456] border-b border-slate-200/70 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-transform duration-300 will-change-transform [backface-visibility:hidden] [-webkit-backface-visibility:hidden] ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* Top bar - hidden on mobile */}
      <div className="hidden sm:block bg-[#0d1836] text-white text-xs border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">

          {/* Left */}
          <div className="flex items-center divide-x divide-white/10">
            <Link href="/contact" className="flex items-center gap-1.5 pr-4 text-white/60 hover:text-white transition-colors">
              <svg className="w-3 h-3 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Contactez-Nous
            </Link>
            <Link href="/services" className="flex items-center gap-1.5 pl-4 text-white/60 hover:text-white transition-colors">
              <svg className="w-3 h-3 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Nos Services
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center divide-x divide-white/10">
            <a href="tel:+212716408919" className="flex items-center gap-1.5 pr-4 text-white/60 hover:text-white transition-colors">
              <svg className="w-3 h-3 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              (+212) 716-408919
            </a>
            <Link href="/compte" className="flex items-center gap-1.5 pl-4 text-white/60 hover:text-white transition-colors">
              {authUser ? (
                <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0">
                  {(authUser.firstName?.[0] ?? 'U').toUpperCase()}{(authUser.lastName?.[0] ?? '').toUpperCase()}
                </span>
              ) : (
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              )}
              {authUser ? authUser.firstName : "Mon Compte"}
            </Link>
          </div>


        </div>
      </div>

      {/* Main header */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1d3372] to-[#162456]">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-5">
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
                  className="font-black text-[22px] sm:text-[26px]"
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
                  className="font-black text-[22px] sm:text-[26px] text-orange-400"
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
              {/* Tagline — hidden on mobile */}
              <div
                className="hidden sm:flex text-white text-[8px] font-bold uppercase mt-[3px] items-center gap-1"
                style={{ animation: 'taglineReveal 0.9s ease-out 0.2s both', opacity: 0 }}
              >
                <span style={{ animation: 'dotSpark 2s ease-in-out 1.2s infinite' }} className="w-[3px] h-[3px] rounded-full bg-orange-400 inline-block" />
                <span className="text-white/50 tracking-[0.22em]">Technologie · Multimédia · Performance</span>
                <span style={{ animation: 'dotSpark 2s ease-in-out 1.6s infinite' }} className="w-[3px] h-[3px] rounded-full bg-orange-400 inline-block" />
              </div>
            </div>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="flex-1 hidden sm:flex relative" ref={searchRef}>
          <form
            className="flex w-full items-center bg-white rounded-full overflow-hidden shadow-[0_10px_30px_rgba(2,6,23,0.14)] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-orange-400/70 transition-all duration-200"
            onSubmit={handleSearch}
          >
            {/* Category selector */}
            <div className="hidden lg:flex items-center relative border-r border-gray-200 flex-shrink-0">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="pl-4 pr-7 py-3 text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer appearance-none max-w-[130px]"
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
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedIdx(-1); }}
              onFocus={() => searchQuery.trim().length >= 2 && setSuggestionsOpen(true)}
              onKeyDown={handleSuggestKeyDown}
              placeholder="Rechercher des produits, marques…"
              className="flex-1 px-5 py-3 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white pl-5 pr-6 py-3 transition-colors flex-shrink-0 flex items-center gap-2"
              aria-label="Rechercher"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="hidden lg:block text-sm font-semibold">Rechercher</span>
            </button>
          </form>

          {/* Live suggestions dropdown */}
          {suggestionsOpen && (
            <div
              className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white rounded-2xl shadow-[0_24px_64px_rgba(15,23,42,0.18)] border border-slate-100 overflow-hidden"
              style={{ animation: "dropdownEnter 0.18s ease-out" }}
            >
              {suggestionsLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Recherche en cours…
                </div>
              ) : suggestions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-400 text-sm">Aucun résultat pour «&nbsp;<span className="font-semibold text-slate-700">{searchQuery}</span>&nbsp;»</p>
                  <Link href="/produits" className="text-orange-500 hover:underline text-xs font-semibold mt-2 inline-block">
                    Voir tous nos produits →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {suggestions.length} produit{suggestions.length > 1 ? "s" : ""} trouvé{suggestions.length > 1 ? "s" : ""}
                    </span>
                    <kbd className="text-[9px] text-slate-300 font-mono">↑↓ Naviguer · Entrée Sélectionner</kbd>
                  </div>
                  <ul>
                    {suggestions.slice(0, 6).map((product, i) => {
                      const disc = Math.round((1 - product.currentPrice / product.originalPrice) * 100);
                      return (
                        <li key={product.slug} style={{ animation: `rowSlideIn 0.15s ease-out ${i * 35}ms both` }}>
                          <Link
                            href={`/produits/${product.slug}`}
                            onClick={() => { setSuggestionsOpen(false); setSearchQuery(""); setSelectedIdx(-1); }}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${selectedIdx === i ? "bg-orange-50" : "hover:bg-slate-50"}`}
                          >
                            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden">
                              <Image src={product.image} alt={product.name} width={44} height={44} className="object-contain w-full h-full p-1" style={{ mixBlendMode: "multiply" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{product.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{product.brand}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-black text-orange-500">{product.currentPrice.toLocaleString()}€</p>
                              {disc > 0 && (
                                <p className="text-[10px] text-slate-400 line-through leading-none">{product.originalPrice.toLocaleString()}€</p>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="border-t border-slate-100 p-3" style={{ animation: "footerFadeUp 0.2s ease-out 0.22s both", opacity: 0 }}>
                    <Link
                      href={`/recherche?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => { setSuggestionsOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-950 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                      </svg>
                      Voir tous les résultats pour «&nbsp;{searchQuery}&nbsp;»
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-auto sm:ml-0">

            {/* ── Mobile icons (< sm) ── */}
            <Link
              href="/compte"
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/75 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="Compte"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </Link>

            <Link
              href="/panier"
              className="sm:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-white/75 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="Panier"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center leading-none ring-2 ring-blue-950 px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: isMenuOpen ? '#f97316' : 'rgba(255,255,255,0.85)' }}
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

            {/* ── Desktop icons (sm+) ── */}
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
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none shadow-[0_2px_6px_rgba(239,68,68,0.5)] px-1">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </div>
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

            {/* Cart (desktop) */}
            <Link
              href="/panier"
              className="hidden sm:flex items-center gap-2.5 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-full transition-all duration-200 shadow-[0_6px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.45)] hover:-translate-y-px"
            >
              <div className="relative flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-2.5 bg-white text-orange-600 text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none shadow-[0_2px_8px_rgba(0,0,0,0.20)] px-1 ring-2 ring-orange-500">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <div className="leading-none">
                <div className="text-[10px] opacity-75 font-medium tracking-wide uppercase">Mon Panier</div>
                <div className="text-sm font-black">{Math.round(cartTotal).toLocaleString()}€</div>
              </div>
            </Link>

            {/* Hamburger (tablet sm–md) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden sm:flex md:hidden w-10 h-10 items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="sm:hidden bg-[#172554] px-3 pb-3 pt-0.5" ref={mobileSearchRef}>
        <form
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-0 shadow-[0_2px_16px_rgba(0,0,0,0.25)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(249,115,22,0.35),0_2px_16px_rgba(0,0,0,0.15)]"
          onSubmit={handleSearch}
        >
          {suggestionsLoading ? (
            <svg className="w-4 h-4 text-orange-400 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedIdx(-1); }}
            onFocus={() => searchQuery.trim().length >= 2 && setSuggestionsOpen(true)}
            onKeyDown={handleSuggestKeyDown}
            placeholder="Rechercher un produit..."
            className="flex-1 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSuggestions([]); setSuggestionsOpen(false); }}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
              aria-label="Effacer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="flex-shrink-0 w-8 h-8 my-1 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center transition-colors shadow-[0_2px_8px_rgba(249,115,22,0.4)]"
            aria-label="Rechercher"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </form>

        {/* Mobile suggestions dropdown */}
        {suggestionsOpen && (
          <div
            className="mt-2 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden"
            style={{ animation: "dropdownEnter 0.18s ease-out" }}
          >
            {suggestionsLoading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-slate-400 text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Recherche en cours…
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-7 text-center">
                <p className="text-slate-400 text-sm">Aucun résultat pour «&nbsp;<span className="font-semibold text-slate-700">{searchQuery}</span>&nbsp;»</p>
                <Link href="/produits" className="text-orange-500 text-xs font-bold mt-2 inline-block">
                  Voir tous nos produits →
                </Link>
              </div>
            ) : (
              <>
                <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{suggestions.length} résultat{suggestions.length > 1 ? "s" : ""}</span>
                </div>
                <ul>
                  {suggestions.slice(0, 5).map((product, i) => {
                    const disc = Math.round((1 - product.currentPrice / product.originalPrice) * 100);
                    return (
                      <li key={product.slug} style={{ animation: `rowSlideIn 0.15s ease-out ${i * 35}ms both` }}>
                        <Link
                          href={`/produits/${product.slug}`}
                          onClick={() => { setSuggestionsOpen(false); setSearchQuery(""); setSelectedIdx(-1); }}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${selectedIdx === i ? "bg-orange-50" : "hover:bg-slate-50"}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden">
                            <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain w-full h-full p-1" style={{ mixBlendMode: "multiply" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{product.brand}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-orange-500">{product.currentPrice.toLocaleString()}€</p>
                            {disc > 0 && <p className="text-[10px] text-slate-400 line-through">{product.originalPrice.toLocaleString()}€</p>}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-slate-100 p-2.5">
                  <Link
                    href={`/recherche?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setSuggestionsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-950 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    Voir tous les résultats
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation bar */}
      <nav className="bg-white/95 backdrop-blur border-b border-slate-200 hidden md:block">
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
                      img: "/Categories images/passerelle multimedia.jpg",
                    },
                    {
                      slug: "accessoires",
                      name: "Accessoires",
                      desc: "Télécommandes, câbles, supports",
                      count: 1,
                      badgeClass: "bg-blue-500 text-white",
                      img: "/Categories images/accessoires.jpg",
                    },
                    {
                      slug: "camera-surveillance",
                      name: "Caméra de Surveillance",
                      desc: "Caméras IP, DVR, kits sécurité",
                      count: 0,
                      badgeClass: "bg-slate-200 text-slate-500",
                      img: "/Categories images/camera de surveillance.jpg",
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
        <div className="md:hidden bg-white border-t border-slate-200/60 shadow-2xl" style={{ maxHeight: "82vh", overflowY: "auto" }}>

          {/* Account banner */}
          <div className="bg-[#172554] px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {authUser ? (
                  <span className="text-sm font-black text-white">
                    {authUser.firstName[0]?.toUpperCase()}{authUser.lastName[0]?.toUpperCase()}
                  </span>
                ) : (
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">
                  {authUser ? `Bonjour, ${authUser.firstName}` : "Mon Espace"}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {authUser ? `${authUser.firstName} ${authUser.lastName}` : "Connectez-vous à votre compte"}
                </p>
              </div>
            </div>
            <Link
              href="/compte"
              onClick={() => setIsMenuOpen(false)}
              className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
            >
              {authUser ? "Mon compte" : "Se connecter"}
            </Link>
          </div>

          {/* Categories */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Catégories</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, slug: "passerelle-multimedia", img: "/Categories images/passerelle multimedia.jpg", name: "Box & TV Stick", bg: "bg-orange-50", border: "border-orange-200", label: "text-orange-700" },
                { id: 2, slug: "accessoires",           img: "/Categories images/accessoires.jpg",           name: "Accessoires",    bg: "bg-blue-50",   border: "border-blue-200",  label: "text-blue-700"   },
                { id: 3, slug: "camera-surveillance",   img: "/Categories images/camera de surveillance.jpg",name: "Caméras",        bg: "bg-violet-50", border: "border-violet-200",label: "text-violet-700" },
              ].map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorie/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex flex-col items-center gap-1.5 pt-3 pb-2.5 px-1 rounded-2xl border ${cat.bg} ${cat.border} active:scale-95 transition-transform overflow-hidden`}
                >
                  <div className="w-full h-14 flex items-center justify-center">
                    <Image src={cat.img} alt={cat.name} width={56} height={56} sizes="56px" className="h-full w-full object-contain drop-shadow-sm" />
                  </div>
                  <span className={`text-[11px] font-bold ${cat.label} text-center leading-tight`}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="px-3 pb-3">
            <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {[
                { href: "/produits",       label: "Tous les produits",  sub: "Box TV, caméras, accessoires",       icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",                                                                                                      iconBg: "bg-slate-100",  iconColor: "text-slate-500",  badge: null },
                { href: "/promotions",     label: "Promotions",         sub: "Offres et réductions en cours",      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",                                        iconBg: "bg-orange-100", iconColor: "text-orange-500", badge: "Actif" },
                { href: "/nouveautes",     label: "Nouveautés",         sub: "Derniers arrivages",                 icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", iconBg: "bg-yellow-100", iconColor: "text-yellow-500", badge: "New" },
                { href: "/suivi-commande", label: "Suivi de commande",  sub: "Vérifier l'état de votre commande", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",                                         iconBg: "bg-green-100",  iconColor: "text-green-600",  badge: null },
                { href: "/favoris",        label: "Mes favoris",        sub: "Vos produits sauvegardés",           icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",                                                iconBg: "bg-pink-100",   iconColor: "text-pink-500",   badge: null },
              ].map(({ href, label, sub, icon, iconBg, iconColor, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white active:bg-slate-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      {badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 leading-none">{badge}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact footer */}
          <div className="border-t border-slate-100 mx-3 mb-3 mt-1 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-[18px] h-[18px] text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">(+212) 716-408919</p>
                  <p className="text-[10px] text-slate-400">Lun–Sam 9h–19h</p>
                </div>
              </div>
              <a
                href="tel:+212716408919"
                className="shrink-0 bg-orange-500 text-white text-[11px] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform"
              >
                Appeler
              </a>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
