"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "login" | "register";

export default function ComptePage() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: false });
  const [registerForm, setRegisterForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "", newsletter: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const benefits = [
    { icon: "🚀", title: "Commandes rapides", desc: "Repassez commande en 1 clic avec vos adresses enregistrées" },
    { icon: "📦", title: "Suivi en temps réel", desc: "Consultez l'état de toutes vos commandes à tout moment" },
    { icon: "❤️", title: "Liste de souhaits", desc: "Sauvegardez les produits qui vous intéressent" },
    { icon: "🎁", title: "Offres exclusives", desc: "Accédez à des promotions réservées aux membres" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero strip ── */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/80">Mon Compte</span>
          </nav>
          <h1 className="text-3xl font-black">Mon Compte</h1>
          <p className="text-white/60 text-sm mt-1">Connectez-vous ou créez votre espace personnel.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* ── Auth card ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                      tab === t
                        ? "text-orange-600 bg-orange-50/50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "login" ? "Se connecter" : "Créer un compte"}
                    {tab === t && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8">

                {/* ── Login form ── */}
                {tab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">
                        Adresse e-mail
                      </label>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="vous@exemple.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-gray-600">Mot de passe</label>
                        <Link href="/compte/mot-de-passe-oublie" className="text-xs text-orange-500 hover:underline font-medium">
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Afficher/masquer"
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginForm.remember}
                        onChange={(e) => setLoginForm((f) => ({ ...f, remember: e.target.checked }))}
                        className="rounded accent-orange-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 font-medium">Se souvenir de moi</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                    >
                      Se connecter
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400 font-medium">ou continuer avec</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Social */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                      Pas encore de compte ?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("register")}
                        className="text-orange-500 font-semibold hover:underline"
                      >
                        Créer un compte
                      </button>
                    </p>
                  </form>
                )}

                {/* ── Register form ── */}
                {tab === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Prénom *</label>
                        <input
                          required
                          type="text"
                          autoComplete="given-name"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))}
                          placeholder="Prénom"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Nom *</label>
                        <input
                          required
                          type="text"
                          autoComplete="family-name"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="Nom de famille"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Adresse e-mail *</label>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="vous@exemple.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+212 6XX XX XX XX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Mot de passe *</label>
                      <div className="relative">
                        <input
                          required
                          minLength={8}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder="Minimum 8 caractères"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Afficher/masquer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Confirmer le mot de passe *</label>
                      <div className="relative">
                        <input
                          required
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          value={registerForm.confirm}
                          onChange={(e) => setRegisterForm((f) => ({ ...f, confirm: e.target.value }))}
                          placeholder="Répéter le mot de passe"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Afficher/masquer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={registerForm.newsletter}
                        onChange={(e) => setRegisterForm((f) => ({ ...f, newsletter: e.target.checked }))}
                        className="rounded accent-orange-500 w-4 h-4 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs text-gray-500 leading-relaxed">
                        Je souhaite recevoir les offres exclusives et nouveautés par e-mail.
                      </span>
                    </label>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      En créant un compte, vous acceptez nos{" "}
                      <Link href="/cgv" className="text-orange-500 hover:underline">Conditions Générales</Link>{" "}
                      et notre{" "}
                      <Link href="/confidentialite" className="text-orange-500 hover:underline">Politique de confidentialité</Link>.
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                    >
                      Créer mon compte
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400 font-medium">ou s&apos;inscrire avec</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                      Déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="text-orange-500 font-semibold hover:underline"
                      >
                        Se connecter
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── Benefits sidebar ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-3xl p-7 text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-sm">Espace membre</p>
                  <p className="text-white/50 text-xs">Les avantages de votre compte</p>
                </div>
              </div>
              <div className="space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <p className="text-sm font-bold leading-tight">{b.title}</p>
                      <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-black text-gray-900 text-sm mb-1">Besoin d&apos;aide ?</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Notre équipe est disponible du lundi au samedi de 9h à 19h.
              </p>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
