"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface WishlistContextType {
  wishlist: string[];
  toggle: (slug: string) => void;
  isWished: (slug: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggle: () => {},
  isWished: () => false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = useCallback((slug: string) => {
    setWishlist((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isWished = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
