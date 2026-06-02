"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
  useEffect(() => {
    // ── Console warning ───────────────────────────────────────────────────
    const warn = "color:#f97316;font-size:22px;font-weight:900;";
    const info = "color:#374151;font-size:13px;";
    console.log("%c⚠️  ATTENTION !", warn);
    console.log(
      "%cCette console est réservée aux développeurs.\nSi quelqu'un vous a demandé de coller quelque chose ici, il s'agit d'une arnaque.",
      info
    );

    // ── Disable drag on images (prevent easy image theft) ─────────────────
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };

    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
