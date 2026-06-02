"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SafeUser } from "@/lib/auth";
import type { Order } from "@/lib/types";

type Tab = "login" | "register";
type AccountTab = "profile" | "orders" | "address";

function statusLabel(s: Order["status"]) {
  const map: Record<Order["status"], { label: string; color: string }> = {
    pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-700" },
    shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Livrée",      color: "bg-green-100 text-green-700" },
    cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700" },
  };
  return map[s] ?? { label: s, color: "bg-gray-100 text-gray-700" };
}

export default function ComptePage() {
  const [authTab, setAuthTab] = useState<Tab>("login");
  const [accountTab, setAccountTab] = useState<AccountTab>("profile");
  const [user, setUser] = useState<SafeUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [regForm, setRegForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [showRegPw, setShowRegPw] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "", street: "", city: "", postalCode: "", country: "Maroc" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    fetch("/api/auth/google/status").then(r => r.json()).then(d => setGoogleEnabled(Boolean(d.enabled)));
  }, []);

  // Read OAuth error from redirect query param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      const msgs: Record<string, string> = {
        google_denied: "Connexion Google annulée.",
        invalid_state: "Erreur de sécurité. Veuillez réessayer.",
        token_exchange: "Erreur lors de la connexion Google. Réessayez.",
        userinfo: "Impossible de récupérer les informations Google.",
        no_email: "Google n'a pas fourni d'adresse e-mail.",
        google_not_configured: "Connexion Google non disponible pour le moment.",
      };
      setError(msgs[oauthError] ?? "Erreur de connexion Google.");
      // Clean the URL without reload
      window.history.replaceState({}, "", "/compte");
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? "",
        street: user.address?.street ?? "", city: user.address?.city ?? "",
        postalCode: user.address?.postalCode ?? "", country: user.address?.country ?? "Maroc",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && accountTab === "orders") {
      fetch("/api/orders").then(r => r.json()).then(d => setOrders(d.orders ?? []));
    }
  }, [user, accountTab]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setUser(data.user); setSuccess("Connexion reussie !");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess("");
    if (regForm.password !== regForm.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(regForm) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setUser(data.user); setSuccess("Compte cree avec succes !");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); setOrders([]);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault(); setSavingProfile(true); setError(""); setSuccess("");
    const res = await fetch("/api/auth/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone,
        address: { street: profileForm.street, city: profileForm.city, postalCode: profileForm.postalCode, country: profileForm.country } }),
    });
    const data = await res.json(); setSavingProfile(false);
    if (!res.ok) { setError(data.error); return; }
    setUser(data.user); setSuccess("Profil mis a jour !");
  }

  const [savingAvatar, setSavingAvatar] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image trop volumineuse (max 2 Mo)."); return; }
    setSavingAvatar(true); setError(""); setSuccess("");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone, address: { street: profileForm.street, city: profileForm.city, postalCode: profileForm.postalCode, country: profileForm.country }, avatar: base64 }),
      });
      const data = await res.json();
      setSavingAvatar(false);
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user); setSuccess("Photo mise à jour !");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleRemoveAvatar() {
    setSavingAvatar(true); setError(""); setSuccess("");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone, address: { street: profileForm.street, city: profileForm.city, postalCode: profileForm.postalCode, country: profileForm.country }, avatar: null }),
    });
    const data = await res.json();
    setSavingAvatar(false);
    if (!res.ok) { setError(data.error); return; }
    setUser(data.user); setSuccess("Photo supprimée.");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white py-7 sm:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-3 sm:mb-4">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span><span className="text-white/80">Mon Compte</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black">Mon Compte</h1>
          <p className="text-white/60 text-sm mt-1">{user ? `Bienvenue, ${user.firstName} !` : "Connectez-vous ou créez votre espace personnel."}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !user && (
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                {/* Orange accent top bar */}
                <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />

                {/* Tabs */}
                <div className="flex bg-gray-50/80 border-b border-gray-100">
                  {(["login", "register"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => { setAuthTab(t); setError(""); setSuccess(""); }}
                      className={`flex-1 py-4 text-sm font-bold transition-all relative ${authTab === t ? "text-gray-900 bg-white" : "text-gray-400 hover:text-gray-600"}`}>
                      {t === "login" ? "Se connecter" : "Créer un compte"}
                      {authTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                    </button>
                  ))}
                </div>

                <div className="p-5 sm:p-8 lg:p-10">
                  {/* Alerts */}
                  {error && (
                    <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {success}
                    </div>
                  )}

                  {/* ── LOGIN FORM ── */}
                  {authTab === "login" && (
                    <form onSubmit={handleLogin} className="space-y-5">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse e-mail</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <input type="email" required autoComplete="email"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="vous@exemple.com" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                          <button type="button" onClick={() => { setShowForgotPw(true); setForgotEmail(loginForm.email); setForgotMsg(""); }} className="text-xs text-orange-500 font-medium cursor-pointer hover:text-orange-600 hover:underline">Mot de passe oublié ?</button>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          </div>
                          <input type={showLoginPw ? "text" : "password"} required autoComplete="current-password"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                          <button type="button" onClick={() => setShowLoginPw(p => !p)} aria-label="Afficher/masquer le mot de passe"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showLoginPw
                              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                          </button>
                        </div>
                      </div>

                      {/* Remember me */}
                      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <input type="checkbox" className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors font-medium">Se souvenir de moi</span>
                      </label>

                      {/* CTA */}
                      <button type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-orange-200 text-sm tracking-wide">
                        Se connecter
                      </button>

                      {/* Google sign-in */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium px-1">ou continuer avec</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <a href="/api/auth/google"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuer avec Google
                      </a>

                      <p className="text-center text-sm text-gray-500">
                        Pas encore de compte ?{" "}
                        <button type="button" onClick={() => setAuthTab("register")} className="text-orange-600 font-semibold hover:underline">
                          S&apos;inscrire gratuitement
                        </button>
                      </p>

                      {/* Trust badge */}
                      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-gray-50 mt-2">
                        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-xs text-gray-300">Connexion sécurisée · Données protégées</span>
                      </div>
                    </form>
                  )}

                  {/* ── REGISTER FORM ── */}
                  {authTab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                          <input type="text" required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Prénom" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                          <input type="text" required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nom de famille" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse e-mail</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <input type="email" required autoComplete="email"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="vous@exemple.com" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Téléphone <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <input type="tel"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} placeholder="+212 6 00 00 00 00" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          </div>
                          <input type={showRegPw ? "text" : "password"} required minLength={6}
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 caractères" />
                          <button type="button" onClick={() => setShowRegPw(p => !p)} aria-label="Afficher/masquer le mot de passe"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showRegPw
                              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                        <input type={showRegPw ? "text" : "password"} required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                          value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
                      </div>

                      {/* CTA */}
                      <button type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-orange-200 text-sm tracking-wide">
                        Créer mon compte gratuitement
                      </button>

                      {/* Google sign-up */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium px-1">ou continuer avec</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <a href="/api/auth/google"
                        className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        S&apos;inscrire avec Google
                      </a>

                      <p className="text-center text-sm text-gray-500">
                        Déjà un compte ?{" "}
                        <button type="button" onClick={() => setAuthTab("login")} className="text-orange-600 font-semibold hover:underline">
                          Se connecter
                        </button>
                      </p>

                      {/* Trust badge */}
                      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-gray-50 mt-2">
                        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-xs text-gray-300">Inscription gratuite · Aucune carte requise</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Member benefits card */}
              <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-3xl p-7 text-white">
                <div className="flex items-center gap-3 mb-6">
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
                  {[
                    { icon: "🚀", title: "Commandes rapides", desc: "Repassez commande en 1 clic avec vos adresses enregistrées" },
                    { icon: "📦", title: "Suivi en temps réel", desc: "Consultez l'état de toutes vos commandes à tout moment" },
                    { icon: "❤️", title: "Liste de souhaits", desc: "Sauvegardez les produits qui vous intéressent" },
                    { icon: "🎁", title: "Offres exclusives", desc: "Accédez à des promotions réservées aux membres" },
                  ].map(b => (
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
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">Notre équipe est disponible du lundi au samedi de 9h à 19h.</p>
                <Link href="/contact" className="flex items-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contacter le support
                </Link>
              </div>
            </div>
          </div>
        )}

        {!loading && user && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-6 pb-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with upload */}
                    <div className="relative mb-3 group">
                      <input
                        type="file" id="avatar-upload" accept="image/*"
                        className="sr-only" onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer block">
                        <div className="w-16 h-16 rounded-full ring-4 ring-white/30 overflow-hidden flex items-center justify-center text-xl font-black text-white relative">
                          {user.avatar
                            ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            : <span className="bg-white/20 w-full h-full flex items-center justify-center">{user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}</span>
                          }
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {savingAvatar
                              ? <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            }
                          </div>
                        </div>
                      </label>
                      {/* Remove button — only when photo exists */}
                      {user.avatar && !savingAvatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          title="Supprimer la photo"
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        >
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <p className="font-black text-white text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-orange-100 text-xs mt-0.5 truncate max-w-[160px]">{user.email}</p>
                    <span className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Membre vérifié
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  {/* Mon compte section */}
                  <p className="px-3 pt-2 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mon compte</p>
                  {([
                    { id: "profile", label: "Mon profil", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )},
                    { id: "orders", label: "Mes commandes", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                    )},
                    { id: "address", label: "Mon adresse", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )},
                  ] as { id: AccountTab; label: string; icon: React.ReactNode }[]).map(item => (
                    <button key={item.id} onClick={() => setAccountTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        accountTab === item.id
                          ? "bg-orange-50 text-orange-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`}>
                      <span className={`flex-shrink-0 ${accountTab === item.id ? "text-orange-500" : "text-gray-400"}`}>{item.icon}</span>
                      {item.label}
                      {accountTab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </button>
                  ))}

                  {/* Découvrir section */}
                  <p className="px-3 pt-4 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Découvrir</p>
                  {([
                    { href: "/favoris", label: "Mes favoris", color: "hover:bg-rose-50 hover:text-rose-600", iconColor: "text-gray-400 group-hover:text-rose-500", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    )},
                    { href: "/comparer", label: "Mes comparaisons", color: "hover:bg-blue-50 hover:text-blue-600", iconColor: "text-gray-400 group-hover:text-blue-500", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    )},
                    { href: "/suivi-commande", label: "Suivi de commande", color: "hover:bg-violet-50 hover:text-violet-600", iconColor: "text-gray-400 group-hover:text-violet-500", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    )},
                    { href: "/promotions", label: "Promotions", color: "hover:bg-amber-50 hover:text-amber-600", iconColor: "text-gray-400 group-hover:text-amber-500", icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    )},
                  ]).map(item => (
                    <Link key={item.href} href={item.href}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 transition-all ${item.color}`}>
                      <span className={`flex-shrink-0 transition-colors ${item.iconColor}`}>{item.icon}</span>
                      {item.label}
                      <svg className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}

                  {/* Logout */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all group">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}
              {accountTab === "profile" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <h2 className="text-xl font-black text-gray-800 mb-6">Informations personnelles</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Prenom</label><input type="text" required className={inputCls} value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} /></div>
                      <div><label className={labelCls}>Nom</label><input type="text" required className={inputCls} value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} /></div>
                    </div>
                    <div><label className={labelCls}>Email</label><input type="email" className={inputCls + " bg-gray-50 text-gray-400 cursor-not-allowed"} value={user.email} readOnly /></div>
                    <div><label className={labelCls}>Telephone</label><input type="tel" className={inputCls} value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+212 6 00 00 00 00" /></div>
                    <button type="submit" disabled={savingProfile} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition">
                      {savingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </form>
                </div>
              )}
              {accountTab === "address" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <h2 className="text-xl font-black text-gray-800 mb-6">Adresse de livraison</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div><label className={labelCls}>Rue / Adresse</label><input type="text" className={inputCls} value={profileForm.street} onChange={e => setProfileForm(f => ({ ...f, street: e.target.value }))} placeholder="123 Rue Mohammed V" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Ville</label><input type="text" className={inputCls} value={profileForm.city} onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))} placeholder="Casablanca" /></div>
                      <div><label className={labelCls}>Code postal</label><input type="text" className={inputCls} value={profileForm.postalCode} onChange={e => setProfileForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="20000" /></div>
                    </div>
                    <div><label className={labelCls}>Pays</label><input type="text" className={inputCls} value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))} /></div>
                    <button type="submit" disabled={savingProfile} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition">
                      {savingProfile ? "Enregistrement..." : "Enregistrer l adresse"}
                    </button>
                  </form>
                </div>
              )}
              {accountTab === "orders" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <h2 className="text-xl font-black text-gray-800 mb-6">Mes commandes</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-4">📦</div>
                      <p className="text-gray-500 font-semibold">Aucune commande pour l instant</p>
                      <Link href="/produits" className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition">Decouvrir nos produits</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => {
                        const { label, color } = statusLabel(order.status);
                        return (
                          <div key={order.id} className="border border-gray-100 rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="font-bold text-gray-800 text-sm">Commande #{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{label}</span>
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-700 truncate">{item.productName}</p>
                                    <p className="text-xs text-gray-400">Qte: {item.quantity} x {item.price.toFixed(2)}€</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Total</span>
                              <span className="font-black text-gray-800">{order.total.toFixed(2)}€</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowForgotPw(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Mot de passe oublié ?</h3>
              <p className="text-sm text-gray-500 mt-1">Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.</p>
            </div>
            {forgotMsg && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${forgotMsg.includes("envoyé") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {forgotMsg}
              </div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotLoading(true);
              setForgotMsg("");
              try {
                const res = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: forgotEmail }),
                });
                const data = await res.json();
                if (res.ok) {
                  setForgotMsg("Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.");
                } else {
                  setForgotMsg(data.error || "Erreur. Veuillez réessayer.");
                }
              } catch {
                setForgotMsg("Erreur réseau.");
              } finally {
                setForgotLoading(false);
              }
            }} className="space-y-4">
              <input
                type="email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
              <button type="submit" disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-50">
                {forgotLoading ? "Envoi..." : "Envoyer le lien"}
              </button>
              <button type="button" onClick={() => setShowForgotPw(false)} className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2">
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
