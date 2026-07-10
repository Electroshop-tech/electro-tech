"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import PageTransition from "./PageTransition";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCheckout = pathname.startsWith("/commander");
  const isMaintenance = pathname === "/maintenance";
  const hideHeader = isCheckout || isMaintenance;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShowTop(window.scrollY > 400));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {!isAdmin && !hideHeader && <Header />}
      <main>{isAdmin || isMaintenance ? children : <PageTransition>{children}</PageTransition>}</main>
      {!isAdmin && !isMaintenance && <Footer />}
      {!isAdmin && !isMaintenance && <CookieConsent />}
      {!isAdmin && !isMaintenance && showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
          className="flex fixed bottom-24 left-5 z-50 w-11 h-11 bg-slate-800 hover:bg-orange-500 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.35)] items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      {!isAdmin && !isMaintenance && (
        <a
          href="https://wa.me/212716408919"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter sur WhatsApp"
          className="fixed right-5 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bc5c] rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.004 0C7.163 0 0 7.163 0 16c0 2.824.737 5.482 2.025 7.795L0 32l8.418-2.01A15.94 15.94 0 0016.004 32C24.837 32 32 24.837 32 16S24.837 0 16.004 0zm0 29.25a13.19 13.19 0 01-6.727-1.843l-.48-.286-4.997 1.194 1.232-4.87-.314-.503A13.21 13.21 0 012.75 16c0-7.31 5.944-13.25 13.254-13.25S29.25 8.69 29.25 16 23.31 29.25 16.004 29.25zM23.34 19.394c-.371-.185-2.194-1.082-2.534-1.205-.34-.123-.587-.185-.835.185-.247.37-.959 1.205-1.175 1.452-.217.247-.433.278-.804.093-.371-.185-1.567-.578-2.985-1.842-1.103-.985-1.848-2.2-2.065-2.572-.217-.37-.023-.57.163-.754.167-.166.371-.432.556-.648.185-.216.247-.37.37-.617.124-.247.062-.464-.031-.648-.093-.185-.835-2.014-1.144-2.756-.301-.724-.607-.625-.835-.636l-.711-.013c-.247 0-.649.093-.989.464-.34.37-1.299 1.268-1.299 3.09 0 1.822 1.33 3.583 1.515 3.83.185.247 2.617 3.997 6.342 5.607.886.382 1.577.61 2.115.781.888.282 1.697.243 2.336.147.712-.106 2.194-.897 2.503-1.762.309-.865.309-1.606.216-1.762-.092-.154-.34-.247-.71-.432z" />
          </svg>
        </a>
      )}
    </>
  );
}
