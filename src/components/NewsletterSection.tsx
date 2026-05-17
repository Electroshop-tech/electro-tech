"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-6">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          Recevez nos offres{" "}
          <span className="text-orange-500">Android TV Box</span>
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Ventes flash, nouveautés et promos exclusives — directement dans votre boite mail
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-gray-800">Merci, vous êtes inscrit !</p>
            <p className="text-gray-400 text-sm">Vous recevrez nos prochaines offres en priorité.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse e-mail *"
                required
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 bg-white outline-none focus:border-orange-400 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
            <p className="text-gray-400 text-xs mt-4">
              Pas de spam · Désinscription en un clic
            </p>
          </>
        )}

      </div>
    </section>
  );
}