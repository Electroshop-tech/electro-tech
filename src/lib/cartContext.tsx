"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  slug: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  sessionId: string;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Stable anonymous id used to follow up on abandoned carts.
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("electro-session");
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `s_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem("electro-session", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setMounted(true);
    setSessionId(getSessionId());
    try {
      const stored = localStorage.getItem("electro-cart");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("electro-cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  // Debounced abandoned-cart tracking (best-effort, non-blocking).
  useEffect(() => {
    if (!mounted || !sessionId || items.length === 0) return;
    const t = setTimeout(() => {
      fetch("/api/cart/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          items: items.map((i) => ({
            productId: i.id,
            productName: i.name,
            productImage: i.image,
            quantity: i.qty,
            price: i.price,
          })),
        }),
      }).catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  }, [items, mounted, sessionId]);

  const addToCart = (product: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: number, delta: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, cartCount, cartTotal, sessionId, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
