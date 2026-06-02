"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg className="w-[21px] h-[21px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.7} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/produits",
    label: "Produits",
    icon: (active: boolean) => (
      <svg className="w-[21px] h-[21px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.7} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/panier",
    label: "Panier",
    badge: "cart" as const,
    icon: (active: boolean) => (
      <svg className="w-[21px] h-[21px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.7} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/favoris",
    label: "Favoris",
    badge: "wish" as const,
    icon: (active: boolean) => (
      <svg className="w-[21px] h-[21px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.7} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    href: "/compte",
    label: "Compte",
    icon: (active: boolean) => (
      <svg className="w-[21px] h-[21px]" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.7} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function MobileNavBar() {
  const [visible, setVisible] = useState(false);
  const [ripple, setRipple] = useState<string | null>(null);
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const activeIndex = NAV_ITEMS.findIndex((item) => isActive(item.href));

  const getBadge = (badge?: "cart" | "wish") => {
    if (badge === "cart") return cartCount;
    if (badge === "wish") return wishlistCount;
    return 0;
  };

  const handleTap = (href: string) => {
    setRipple(href);
    setTimeout(() => setRipple(null), 500);
  };

  return (
    <nav
      aria-label="Navigation mobile"
      className={`sm:hidden fixed left-3 right-3 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-[130%] opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      <div
        className="relative rounded-2xl backdrop-blur-2xl border shadow-[0_8px_40px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset]"
        style={{
          background: "rgba(10,14,28,0.97)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        {/* Top accent hairline */}
        <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />

        {/* Sliding active pill */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-2 bottom-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            style={{
              width: "20%",
              transform: `translateX(${activeIndex * 100}%)`,
              background: "linear-gradient(160deg, rgba(249,115,22,0.16) 0%, rgba(251,146,60,0.06) 100%)",
              border: "1px solid rgba(249,115,22,0.22)",
              boxShadow: "0 0 18px rgba(249,115,22,0.10)",
            }}
          />
        )}

        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const badge = getBadge(item.badge);
            const isRippling = ripple === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onTouchStart={() => handleTap(item.href)}
                className="flex-1 flex flex-col items-center justify-center py-3.5 gap-1.5 relative select-none"
              >
                {/* Tap ripple */}
                {isRippling && (
                  <span
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at center, rgba(249,115,22,0.20) 0%, transparent 70%)",
                      animation: "navRipple 0.45s ease-out forwards",
                    }}
                  />
                )}

                {/* Icon */}
                <span
                  className={`relative z-10 transition-all duration-250 ${
                    active ? "text-orange-400 scale-[1.12]" : "text-slate-500 scale-100"
                  }`}
                  style={active ? { filter: "drop-shadow(0 0 5px rgba(251,146,60,0.55))" } : undefined}
                >
                  {item.icon(active)}

                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none border-[1.5px] shadow-[0_0_8px_rgba(249,115,22,0.65)]" style={{ borderColor: "rgba(10,14,28,0.97)" }}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={`relative z-10 text-[10px] font-semibold leading-none tracking-wide transition-all duration-250 ${
                    active ? "text-orange-400" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {active && (
                  <span
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: 16,
                      height: 2,
                      background: "linear-gradient(90deg, #fb923c, #f97316)",
                      boxShadow: "0 0 6px rgba(249,115,22,0.8)",
                    }}
                  />
                )}
              </Link>
            );
          })}
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
