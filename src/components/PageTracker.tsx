"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (url === lastTracked.current) return;
    lastTracked.current = url;

    const referrer = document.referrer ?? "";
    const sessionId = getSessionId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, referrer, sessionId }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
