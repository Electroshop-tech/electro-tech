"use client";

import { CartProvider } from "@/lib/cartContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
