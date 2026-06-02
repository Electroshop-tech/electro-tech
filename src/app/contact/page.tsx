"use client";

import { useState } from "react";
import Link from "next/link";

const contactInfo = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Téléphone",
    lines: ["(+212) 716-408919"],
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "E-mail",
    lines: ["contact@electroshop-tech.com"],
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Adresse",
    lines: ["Boulevard Zerktouni, Maarif", "Casablanca 20100, Maroc"],
    color: "bg-green-50 text-green-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Horaires",
    lines: ["Lun – Ven : 9h00 – 19h00", "Sam : 9h00 – 18h00", "Dim : 10h00 – 15h00"],
    color: "bg-purple-50 text-purple-600",
  },
];

const faqs = [
  {
    q: "Quel est le délai de livraison ?",
    a: "La livraison est effectuée sous 24 à 48h ouvrées pour toutes les commandes passées avant 14h00.",
  },
  {
    q: "Proposez-vous la livraison gratuite ?",
    a: "Oui ! La livraison est offerte pour toute commande supérieure ou égale à 50€.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Après validation de votre commande, vous recevez un e-mail avec un numéro de suivi pour tracking en temps réel.",
  },
  {
    q: "Quelle est la durée de garantie ?",
    a: "Tous nos produits sont garantis 12 mois minimum. Certains articles bénéficient d'une garantie étendue de 24 mois.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Oui, vous disposez de 30 jours à compter de la réception pour retourner un article non utilisé dans son emballage d'origine.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setSendError(d.error ?? "Erreur lors de l'envoi.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setSendError("Impossible d'envoyer le message. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16">
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/70">Contact</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Contactez-nous
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
                On est là<br /><span className="text-orange-400">pour vous aider</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Une question, un conseil ou un problème avec votre commande ? Notre équipe vous répond sous 24h ouvrées.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6 shrink-0">
              <a href="tel:+212716408919" className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <div>
                  <p className="text-white font-bold text-sm">(+212) 716-408919</p>
                  <p className="text-slate-400 text-xs">Appel direct</p>
                </div>
              </a>
              <a href="mailto:contact@electroshop-tech.com" className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 rounded-2xl px-5 py-3 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                  <p className="text-white font-bold text-sm">Envoyer un e-mail</p>
                  <p className="text-orange-200 text-xs">contact@electroshop-tech.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="relative h-10 overflow-hidden">
          <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" fill="#f9fafb" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,40 1440,0 L1440,40 Z" />
          </svg>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-orange-100 transition-all">
              <div className={`w-10 h-10 ${info.color} rounded-xl flex items-center justify-center mb-3`}>
                {info.icon}
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{info.title}</p>
              {info.lines.map((line) => (
                <p key={line} className="text-sm font-semibold text-gray-800 leading-snug">{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Contact form + Map ── */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-1">Envoyez-nous un message</h2>
              <p className="text-sm text-gray-500 mb-6">Réponse garantie sous 24h ouvrées.</p>

              {submitted ? (
                <div className="flex flex-col items-center text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Merci <strong>{form.name}</strong>. Notre équipe vous contactera dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="mt-6 text-sm font-semibold text-orange-500 hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom complet *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Votre nom"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+212 6XX XX XX XX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Adresse e-mail *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="vous@exemple.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Sujet *</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Choisir un sujet</option>
                      <option>Question sur un produit</option>
                      <option>Suivi de commande</option>
                      <option>Retour / Échange</option>
                      <option>Problème technique</option>
                      <option>Partenariat / Grossiste</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez votre demande en détail…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {sending ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    {sending ? "Envoi en cours…" : "Envoyer le message"}
                  </button>
                  {sendError && (
                    <p className="text-xs text-red-500 font-semibold text-center mt-1">{sendError}</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Right column: Map + FAQ */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Map */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-52 overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Boulevard+Zerktouni,Maarif,Casablanca,Morocco&output=embed&z=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ElectroShop-Tech localisation"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">Boulevard Zerktouni, Maarif</p>
                  <p className="text-xs text-gray-400">Casablanca 20100, Maroc</p>
                </div>
                <a
                  href="https://maps.google.com/?q=Boulevard+Zerktouni+Maarif+Casablanca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors shrink-0"
                >
                  Ouvrir
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex-1">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-500">FAQ</span>
                <span>— Questions fréquentes</span>
              </h3>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-gray-800 leading-snug">{faq.q}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
