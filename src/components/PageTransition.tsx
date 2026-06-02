"use client";

import { usePathname } from "next/navigation";

/**
 * Lightweight, dependency-free page transition.
 * Replays a short fade/slide-in animation each time the route changes by
 * keying the wrapper on the pathname. Honors prefers-reduced-motion via CSS.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
