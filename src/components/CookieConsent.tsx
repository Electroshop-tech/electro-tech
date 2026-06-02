"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0d1836] border-t border-white/10 px-4 py-4 sm:px-6 shadow-[0_-8px_40px_rgba(0,0,0,0.35)] animate-[slideUp_0.3s_ease-out]"
      style={{ animation: "slideUp 0.35s ease-out" }}
    >
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl mt-0.5 flex-shrink-0">🍪</span>
          <div>
            <p className="text-white text-sm font-bold mb-0.5">Cookies &amp; Confidentialité</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nous utilisons des cookies techniques nécessaires au bon fonctionnement du site (panier, session).
              Aucune donnée personnelle n&apos;est partagée à des fins publicitaires.{" "}
              <Link href="/confidentialite" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">
                En savoir plus
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none text-slate-400 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
          >
            Accepter tout
          </button>
        </div>
      </div>
    </div>
  );
}
