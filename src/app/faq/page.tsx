"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    category: "Commandes & Paiement",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    items: [
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les cartes Visa/Mastercard, le virement bancaire, et le paiement a la livraison disponible sur certaines zones." },
      { q: "Puis-je modifier ou annuler ma commande ?", a: "Vous pouvez annuler ou modifier votre commande dans les 2 heures suivant la validation en nous contactant. Au-dela, si le colis est expedie, vous devrez effectuer un retour." },
      { q: "Puis-je commander par telephone ?", a: "Oui, notre equipe est disponible au (+212) 716-408919 du lundi au samedi de 9h a 19h pour prendre votre commande par telephone." },
    ],
  },
  {
    category: "Livraison",
    icon: "M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM3 4h13M3 9h13M3 14h4",
    items: [
      { q: "Quels sont les delais de livraison ?", a: "Livraison sous 24-48h dans les grandes villes (Casablanca, Rabat, Marrakech, Fes, Agadir). 48-72h pour les autres villes. Expedition le jour meme pour les commandes avant 14h." },
      { q: "La livraison est-elle gratuite ?", a: "Oui, la livraison est gratuite sur toutes les commandes, sans minimum d'achat, partout au Maroc." },
      { q: "Comment suivre ma livraison ?", a: "Vous recevrez un email et SMS avec un numero de suivi des l'expedition. Vous pouvez aussi utiliser notre page Suivi de commande." },
    ],
  },
  {
    category: "Produits & Garantie",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    items: [
      { q: "Les produits sont-ils authentiques ?", a: "Absolument. Tous nos produits sont 100% authentiques et sources directement aupres des fabricants officiels. Nous ne vendons aucun produit contrefait." },
      { q: "Quelle est la duree de la garantie ?", a: "Tous nos produits sont garantis 1 an contre les pannes materielles. La garantie couvre le remplacement ou la reparation sans frais supplementaires." },
      { q: "Nos box Android TV sont-elles compatibles avec Netflix, YouTube, etc. ?", a: "Oui, nos box Android TV sont compatibles avec toutes les grandes plateformes de streaming : Netflix, YouTube, Prime Video, Disney+, Spotify et bien d'autres via le Google Play Store." },
    ],
  },
  {
    category: "Retours & SAV",
    icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
    items: [
      { q: "Puis-je retourner un produit ?", a: "Oui, vous disposez de 14 jours a compter de la reception pour retourner un produit dans son emballage d'origine. Le remboursement est effectue sous 5-7 jours ouvres." },
      { q: "Mon produit est en panne, que faire ?", a: "Contactez notre SAV par email ou telephone avec votre numero de commande. Notre equipe diagnostiquera le probleme et vous proposera une solution sous 24h." },
      { q: "Les frais de retour sont-ils a ma charge ?", a: "Les frais de retour sont a votre charge, sauf en cas de produit defectueux ou d'erreur de notre part, auquel cas nous prenons en charge les frais." },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);
  function toggle(key: string) { setOpen((prev) => (prev === key ? null : key)); }

  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-10 sm:pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-10 sm:pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Questions frequentes
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Questions<br />
                <span className="text-orange-400">frequentes</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Trouvez rapidement les réponses sur nos produits, livraisons, retours et garanties.
              </p>
            </div>

            {/* Right — category quick nav */}
            <div className="hidden lg:flex flex-col gap-3 pb-16">
              {faqs.map((cat) => (
                <div key={cat.category} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs">{cat.category}</p>
                    <p className="text-slate-500 text-xs">{cat.items.length} question{cat.items.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {faqs.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                  </div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{cat.category}</h2>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item) => {
                    const key = `${cat.category}-${item.q}`;
                    const isOpen = open === key;
                    return (
                      <div key={item.q} className={`border rounded-xl overflow-hidden transition-all ${isOpen ? "border-orange-300 shadow-sm" : "border-slate-100"}`}>
                        <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors">
                          <span className="text-slate-900 font-bold text-sm pr-4">{item.q}</span>
                          <svg className={`w-4 h-4 text-orange-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 bg-white">
                            <p className="text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 sticky top-24">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-5">Sommaire</p>
              <nav className="space-y-3">
                {faqs.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2 group">
                    <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                    <span className="text-slate-400 text-xs group-hover:text-orange-400 transition-colors cursor-default">{cat.category}</span>
                  </div>
                ))}
              </nav>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6">
              <p className="text-white font-black text-sm mb-1">Pas de reponse ?</p>
              <p className="text-orange-100 text-xs mb-4 leading-relaxed">Notre equipe est disponible 7j/7 pour vous aider.</p>
              <Link href="/contact" className="block text-center bg-white text-orange-500 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                Contacter le support &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
