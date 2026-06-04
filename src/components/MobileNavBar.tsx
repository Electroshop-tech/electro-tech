"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cartContext";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg className="w-[23px] h-[23px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.9} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h4.25v-5.5h4.5V20h4.25v-9.5" />
      </svg>
    ),
  },
  {
    href: "/promotions",
    label: "Offres",
    icon: (active: boolean) => (
      <svg className="w-[23px] h-[23px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.9} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2.75 4.75 13h6.5L10 21.25 19.25 10h-6.5L13 2.75Z" />
      </svg>
    ),
  },
  {
    href: "/produits",
    label: "Menu",
    featured: true,
    match: ["/categorie"],
    icon: () => (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M5 12h14M5 17h8" />
      </svg>
    ),
  },
  {
    href: "/panier",
    label: "Panier",
    badge: "cart" as const,
    icon: (active: boolean) => (
      <svg className="w-[23px] h-[23px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.9} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2l1.35 9.15a2 2 0 0 0 1.98 1.7h6.95a2 2 0 0 0 1.92-1.45L20 8H7.1M10 20.25h.01M17 20.25h.01" />
      </svg>
    ),
  },
  {
    href: "/compte",
    label: "Compte",
    icon: (active: boolean) => (
      <svg className="w-[23px] h-[23px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.9} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
      </svg>
    ),
  },
];

export default function MobileNavBar() {
  const [ripple, setRipple] = useState<string | null>(null);
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href) || (item.match?.some((match) => pathname.startsWith(match)) ?? false);
  };

  const getBadge = (badge?: "cart") => {
    if (badge === "cart") return cartCount;
    return 0;
  };

  const handleTap = (href: string) => {
    setRipple(href);
    setTimeout(() => setRipple(null), 500);
  };

  return (
    <nav
      aria-label="Navigation mobile"
      className="sm:hidden fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        left: 10,
        right: 10,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div className="relative mx-auto w-full max-w-[300px]">
        <div className="absolute -inset-x-1 -top-8 h-12 rounded-full bg-orange-500/15 blur-2xl" />
        <div className="absolute left-1/2 top-0 h-16 w-24 -translate-x-1/2 -translate-y-8 rounded-full bg-slate-950 shadow-[0_-10px_24px_rgba(15,23,42,0.28)]" />

        <div className="relative overflow-visible rounded-[2rem] border border-white/10 bg-slate-950/95 px-1.5 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.38),0_6px_18px_rgba(249,115,22,0.12)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_-20%,rgba(249,115,22,0.26),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_48%)]" />

          <div className="relative z-10 grid grid-cols-5 items-end">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const badge = getBadge(item.badge);
              const isRippling = ripple === item.href;
              const featured = item.featured;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onPointerDown={() => handleTap(item.href)}
                  className={`group relative flex min-w-0 select-none flex-col items-center justify-end gap-1.5 rounded-[1.35rem] px-1 outline-none transition-all duration-200 ${
                    featured ? "-mt-7 pb-1.5 pt-0" : "min-h-[62px] py-2.5"
                  }`}
                >
                  {isRippling && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[1.35rem]"
                      style={{
                        background: featured
                          ? "radial-gradient(circle at 50% 22%, rgba(249,115,22,0.28) 0%, transparent 68%)"
                          : "radial-gradient(circle at center, rgba(255,255,255,0.14) 0%, transparent 72%)",
                        animation: "navRipple 0.45s ease-out forwards",
                      }}
                    />
                  )}

                  <span
                    className={`relative z-10 flex items-center justify-center transition-all duration-200 ${
                      featured
                        ? `h-14 w-14 rounded-full border-[5px] border-slate-950 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 text-white shadow-[0_12px_28px_rgba(249,115,22,0.42)] ${active ? "scale-105" : "scale-100 group-active:scale-95"}`
                        : `h-9 w-9 rounded-2xl ${active ? "bg-white/12 text-orange-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-white/60 group-hover:bg-white/8 group-hover:text-white"}`
                    }`}
                  >
                    {item.icon(active)}

                    {badge > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-orange-500 px-1 text-[9px] font-black leading-none text-white shadow-[0_6px_12px_rgba(249,115,22,0.45)]">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>

                  <span
                    className={`relative z-10 max-w-full truncate text-[10px] font-black leading-none tracking-wide transition-colors duration-200 ${
                      active ? "text-white" : "text-white/58 group-hover:text-white/85"
                    }`}
                  >
                    {item.label}
                  </span>

                  {active && !featured && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                      style={{
                        width: 18,
                        height: 3,
                        background: "linear-gradient(90deg, #f59e0b, #f97316)",
                        boxShadow: "0 0 10px rgba(249,115,22,0.75)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes navRipple {
          0%   { opacity: 1; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(1.6); }
        }
      `}</style>
    </nav>
  );
}
