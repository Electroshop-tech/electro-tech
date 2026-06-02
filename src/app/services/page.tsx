import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Services — ElectroShop-Tech",
  description: "Découvrez tous les services proposés par ElectroShop-Tech : livraison à domicile, garantie, support technique et installation.",
};

const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    title: "Livraison à domicile",
    color: "bg-orange-50 text-orange-500",
    badge: "Gratuite",
    badgeColor: "bg-orange-100 text-orange-600",
    description:
      "Livraison rapide partout au Maroc sous 24 à 72h ouvrables. Paiement à la livraison disponible — vous payez uniquement à la réception de votre colis.",
    points: [
      "Livraison gratuite sur toutes les commandes",
      "Disponible dans toutes les villes du Maroc",
      "Suivi de commande en temps réel",
      "Paiement à la réception (cash)",
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Garantie produits",
    color: "bg-blue-50 text-blue-500",
    badge: "1 an",
    badgeColor: "bg-blue-100 text-blue-600",
    description:
      "Tous nos produits sont couverts par une garantie constructeur d'un an minimum. En cas de défaut, nous prenons en charge le remplacement ou le remboursement.",
    points: [
      "Garantie 1 an sur tous les articles",
      "Retour sous 7 jours si insatisfait",
      "Remplacement rapide en cas de panne",
      "Produits 100% authentiques et testés",
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Support technique",
    color: "bg-violet-50 text-violet-500",
    badge: "7j/7",
    badgeColor: "bg-violet-100 text-violet-600",
    description:
      "Notre équipe technique est disponible 7j/7 pour vous accompagner dans la configuration et l'utilisation de vos appareils. Assistance par téléphone, WhatsApp et email.",
    points: [
      "Assistance configuration Android TV",
      "Guide d'installation pas-à-pas",
      "Résolution de problèmes à distance",
      "Support WhatsApp réactif",
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Paiement sécurisé",
    color: "bg-emerald-50 text-emerald-500",
    badge: "100% Sécurisé",
    badgeColor: "bg-emerald-100 text-emerald-600",
    description:
      "Paiement à la livraison ou par carte bancaire (CMI) avec cryptage SSL. Vos données bancaires ne sont jamais stockées sur nos serveurs.",
    points: [
      "Paiement à la livraison (cash)",
      "Carte Visa / Mastercard via CMI",
      "Cryptage SSL 256-bit",
      "Aucun stockage de données bancaires",
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: "Retours & échanges",
    color: "bg-rose-50 text-rose-500",
    badge: "7 jours",
    badgeColor: "bg-rose-100 text-rose-600",
    description:
      "Vous disposez de 7 jours après réception pour retourner tout article défectueux ou non conforme. Remboursement ou échange rapide, sans tracas.",
    points: [
      "Retour accepté sous 7 jours",
      "Remboursement ou échange au choix",
      "Prise en charge des frais de retour",
      "Procédure simple et rapide",
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Magasin physique",
    color: "bg-amber-50 text-amber-500",
    badge: "Casablanca",
    badgeColor: "bg-amber-100 text-amber-600",
    description:
      "Venez découvrir nos produits en personne dans notre magasin à Casablanca. Nos conseillers sont là pour vous guider et vous faire découvrir nos dernières nouveautés.",
    points: [
      "Showroom à Casablanca - Maarif",
      "Démonstration des produits en direct",
      "Retrait en magasin disponible",
      "Conseillers spécialisés sur place",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pt-10 sm:pt-20 pb-10 sm:pb-20">
              <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-white/70">Nos Services</span>
              </nav>
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Tout inclus
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Des services<br />
                <span className="text-orange-400">pour vous</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Chez ElectroShop-Tech, nous nous engageons à vous offrir une expérience d&apos;achat complète — de la commande à l&apos;après-vente.
              </p>
            </div>
            {/* Right — service count cards */}
            <div className="hidden lg:flex flex-col gap-4 pb-16">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">{services.length}</p>
                  <p className="text-slate-400 text-xs mt-1">Services inclus</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">7j/7</p>
                  <p className="text-slate-400 text-xs mt-1">Support disponible</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Livraison offerte</p>
                  <p className="text-slate-400 text-xs">Gratuite sur toutes les commandes</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Garantie 1 an</p>
                  <p className="text-slate-400 text-xs">Sur tous nos produits sans exception</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center`}>
                  {service.icon}
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${service.badgeColor}`}>
                  {service.badge}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-2">{service.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Une question sur nos services ?</h2>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Notre équipe est disponible par téléphone, WhatsApp ou email pour répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/212716408919"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-black px-6 py-3 rounded-xl text-sm hover:bg-orange-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors border border-white/20"
            >
              Formulaire de contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
