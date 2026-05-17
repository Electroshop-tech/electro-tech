"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

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

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span><span className="text-white/80">Mon Compte</span>
          </nav>
          <h1 className="text-3xl font-black">Mon Compte</h1>
          <p className="text-white/60 text-sm mt-1">{user ? `Bienvenue, ${user.firstName} !` : "Connectez-vous ou creez votre espace personnel."}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !user && (
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {(["login", "register"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => { setAuthTab(t); setError(""); setSuccess(""); }}
                      className={`flex-1 py-4 text-sm font-bold transition-colors relative ${authTab === t ? "text-orange-600 bg-orange-50/50" : "text-gray-500 hover:text-gray-700"}`}>
                      {t === "login" ? "Se connecter" : "Creer un compte"}
                      {authTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                    </button>
                  ))}
                </div>
                <div className="p-8">
                  {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
                  {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}
                  {authTab === "login" && (
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div><label className={labelCls}>Email</label>
                        <input type="email" required className={inputCls} value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
                      </div>
                      <div><label className={labelCls}>Mot de passe</label>
                        <div className="relative">
                          <input type={showLoginPw ? "text" : "password"} required className={inputCls + " pr-12"} value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                          <button type="button" onClick={() => setShowLoginPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">{showLoginPw ? "👁" : "🔒"}</button>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">Se connecter</button>
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium">ou continuer avec</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <a href="/api/auth/google" className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuer avec Google
                      </a>
                      <p className="text-center text-sm text-gray-500">Pas encore de compte ?{" "}
                        <button type="button" onClick={() => setAuthTab("register")} className="text-orange-600 font-semibold hover:underline">S inscrire</button>
                      </p>
                    </form>
                  )}
                  {authTab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Prenom</label><input type="text" required className={inputCls} value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Mohammed" /></div>
                        <div><label className={labelCls}>Nom</label><input type="text" required className={inputCls} value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Alami" /></div>
                      </div>
                      <div><label className={labelCls}>Email</label><input type="email" required className={inputCls} value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" /></div>
                      <div><label className={labelCls}>Telephone (optionnel)</label><input type="tel" className={inputCls} value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} placeholder="+212 6 00 00 00 00" /></div>
                      <div><label className={labelCls}>Mot de passe</label>
                        <div className="relative">
                          <input type={showRegPw ? "text" : "password"} required minLength={6} className={inputCls + " pr-12"} value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 caracteres" />
                          <button type="button" onClick={() => setShowRegPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showRegPw ? "👁" : "🔒"}</button>
                        </div>
                      </div>
                      <div><label className={labelCls}>Confirmer le mot de passe</label><input type={showRegPw ? "text" : "password"} required className={inputCls} value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" /></div>
                      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">Creer mon compte</button>
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium">ou continuer avec</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <a href="/api/auth/google" className="flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        S inscrire avec Google
                      </a>
                    </form>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[{ icon: "🚀", title: "Commandes rapides", desc: "Repassez commande en 1 clic" }, { icon: "📦", title: "Suivi en temps reel", desc: "Consultez vos commandes" }, { icon: "❤️", title: "Liste de souhaits", desc: "Sauvegardez vos favoris" }, { icon: "🎁", title: "Offres exclusives", desc: "Promotions reservees aux membres" }].map(b => (
                <div key={b.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <span className="text-2xl">{b.icon}</span>
                  <div><p className="font-bold text-gray-800 text-sm">{b.title}</p><p className="text-gray-500 text-xs mt-0.5">{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && user && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-black text-orange-600 mx-auto">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <p className="font-bold text-gray-800 mt-2">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                {([{ id: "profile", label: "Mon profil", icon: "👤" }, { id: "orders", label: "Mes commandes", icon: "📦" }, { id: "address", label: "Mon adresse", icon: "📍" }] as { id: AccountTab; label: string; icon: string }[]).map(item => (
                  <button key={item.id} onClick={() => setAccountTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${accountTab === item.id ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span>{item.icon}</span>{item.label}
                  </button>
                ))}
                <hr className="border-gray-100 my-2" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                  <span>🚪</span> Se deconnecter
                </button>
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
                                    <p className="text-xs text-gray-400">Qte: {item.quantity} x {item.price.toFixed(2)} MAD</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Total</span>
                              <span className="font-black text-gray-800">{order.total.toFixed(2)} MAD</span>
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
    </div>
  );
}
