"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";

const REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "L'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
];

export default function CommanderPage() {
  const router = useRouter();
  const { items: cart, cartTotal: subtotal, clearCart } = useCart();
  const total = subtotal;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", wilaya: "", zip: "", notes: "",
  });
  const [payment, setPayment] = useState<"cod" | "cmi">("cod");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = "Obligatoire";
    if (!form.lastName.trim()) e.lastName = "Obligatoire";
    if (!form.phone.trim() || !/^(0|\+212)[5-7]\d{8}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Numéro invalide (ex: 0612345678)";
    if (!form.address.trim()) e.address = "Obligatoire";
    if (!form.city.trim()) e.city = "Obligatoire";
    if (!form.wilaya) e.wilaya = "Obligatoire";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
    clearCart();
    setTimeout(() => router.push("/commander/confirmation"), 500);
  };

  const ic = (field: keyof typeof form) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-gray-400 outline-none transition-colors focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
      errors[field] ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100" : "border-gray-200"
    }`;

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{children}</label>
  );
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1.5 font-semibold"><span>⚠</span>{msg}</p> : null;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const isFormReady =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.address.trim() !== "" &&
    form.city.trim() !== "" &&
    form.wilaya !== "";

  if (cart.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-5 text-center shadow-sm max-w-sm w-full">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-xl font-black text-slate-900">Votre panier est vide</p>
          <Link href="/produits" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl">Voir les produits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Steps bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-start">
            <Link href="/panier" className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Panier</span>
            </Link>
            <div className="flex-1 h-0.5 bg-orange-300 mt-4 mx-2" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
                <span className="text-white text-xs font-black">2</span>
              </div>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Commander</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-2" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-black">3</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Terminé</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Mobile order summary strip */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs text-gray-500 font-semibold">{totalQty} article{totalQty > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Total</span>
            <span className="text-base font-black text-orange-500">{total.toLocaleString("fr-FR")}€</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Livraison gratuite</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 pb-36 lg:pb-6">
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* 1 · Personal info */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Informations personnelles</p>
                    <p className="text-[11px] text-gray-400">Vos coordonnées de contact</p>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Prénom <span className="text-orange-400 normal-case">*</span></Label>
                      <input value={form.firstName} onChange={set("firstName")} placeholder="Zakaria" className={ic("firstName")} autoComplete="given-name" />
                      <Err msg={errors.firstName} />
                    </div>
                    <div>
                      <Label>Nom <span className="text-orange-400 normal-case">*</span></Label>
                      <input value={form.lastName} onChange={set("lastName")} placeholder="Zemzami" className={ic("lastName")} autoComplete="family-name" />
                      <Err msg={errors.lastName} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Téléphone <span className="text-orange-400 normal-case">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none">🇲🇦</span>
                        <input value={form.phone} onChange={set("phone")} placeholder="0612 345 678" className={`${ic("phone")} pl-10`} type="tel" autoComplete="tel" />
                      </div>
                      <Err msg={errors.phone} />
                    </div>
                    <div>
                      <Label>Email <span className="text-gray-300 normal-case font-normal text-[10px]">(optionnel)</span></Label>
                      <input value={form.email} onChange={set("email")} placeholder="exemple@mail.com" className={ic("email")} type="email" autoComplete="email" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 · Delivery address */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Adresse de livraison</p>
                    <p className="text-[11px] text-gray-400">Où souhaitez-vous recevoir votre commande ?</p>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div>
                    <Label>Adresse complète <span className="text-orange-400 normal-case">*</span></Label>
                    <input value={form.address} onChange={set("address")} placeholder="N° rue, quartier, résidence..." className={ic("address")} autoComplete="street-address" />
                    <Err msg={errors.address} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Ville <span className="text-orange-400 normal-case">*</span></Label>
                      <input value={form.city} onChange={set("city")} placeholder="Ex: Casablanca" className={ic("city")} autoComplete="address-level2" />
                      <Err msg={errors.city} />
                    </div>
                    <div>
                      <Label>Région / Wilaya <span className="text-orange-400 normal-case">*</span></Label>
                      <div className="relative">
                        <select value={form.wilaya} onChange={set("wilaya")} className={`${ic("wilaya")} appearance-none pr-8`}>
                          <option value="">Sélectionner votre région...</option>
                          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <Err msg={errors.wilaya} />
                    </div>
                  </div>
                  <div className="max-w-[200px]">
                    <Label>Code postal <span className="text-gray-300 normal-case font-normal text-[10px]">(optionnel)</span></Label>
                    <input value={form.zip} onChange={set("zip")} placeholder="Ex: 20000" className={ic("zip")} maxLength={5} autoComplete="postal-code" />
                  </div>
                  <div>
                    <Label>Notes de livraison <span className="text-gray-300 normal-case font-normal text-[10px]">(optionnel)</span></Label>
                    <textarea value={form.notes} onChange={set("notes")} placeholder="Instructions particulières pour le livreur..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-gray-400 outline-none transition-colors focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none" />
                  </div>
                </div>
              </div>

              {/* 3 · Payment */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Mode de paiement</p>
                    <p className="text-[11px] text-gray-400">Choisissez votre méthode de règlement</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3 space-y-2">

                  {/* COD */}
                  <label className={`flex items-start gap-3 px-4 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    payment === "cod" ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white hover:bg-gray-50"
                  }`}>
                    <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} className="sr-only" />
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      payment === "cod" ? "border-orange-500" : "border-gray-300"
                    }`}>
                      {payment === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-900">Paiement à la livraison</p>
                        <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full ${
                          payment === "cod" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                        }`}>Populaire</span>
                      </div>
                      <p className="text-[11px] text-gray-400 pl-7">Réglez en espèces à la réception · Sans prépaiement</p>
                    </div>
                  </label>

                  {/* CMI */}
                  <label className={`flex items-start gap-3 px-4 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    payment === "cmi" ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white hover:bg-gray-50"
                  }`}>
                    <input type="radio" name="payment" value="cmi" checked={payment === "cmi"} onChange={() => setPayment("cmi")} className="sr-only" />
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      payment === "cmi" ? "border-orange-500" : "border-gray-300"
                    }`}>
                      {payment === "cmi" && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-900">Carte bancaire (CMI)</p>
                        <div className="ml-auto flex gap-1">
                          <span className="bg-[#1A1F71] text-white text-[8px] font-black px-1.5 py-0.5 rounded italic">VISA</span>
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">MC</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 pl-7">Visa, Mastercard · Paiement SSL sécurisé</p>
                    </div>
                  </label>

                  {/* Trust row */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    {[
                      { path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Paiement sécurisé" },
                      { path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "SSL 256-bit" },
                      { path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", text: "Support 24h" },
                    ].map(({ path, text }) => (
                      <div key={text} className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
                        </svg>
                        <span className="text-[9px] text-gray-400">{text}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Back to cart – mobile */}
              <Link href="/panier" className="lg:hidden flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold py-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour au panier
              </Link>
            </div>

            {/* ── RIGHT COLUMN – Summary (desktop only) ── */}
            <div className="hidden lg:block space-y-4">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-4">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-black text-slate-900">Récapitulatif</p>
                </div>

                <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-100" />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.qty}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.brand}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900 shrink-0">{(item.price * item.qty).toLocaleString("fr-FR")}€</p>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 space-y-3 border-t border-gray-50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Sous-total ({totalQty} art.)</span>
                    <span className="font-bold text-slate-900">{subtotal.toLocaleString("fr-FR")}€</span>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      <p className="text-xs font-bold text-green-800">Livraison à domicile</p>
                    </div>
                    <span className="text-xs font-black text-green-600">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-base font-black text-slate-900">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-500 leading-none">{total.toLocaleString("fr-FR")}€</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">TTC · Livraison gratuite</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!isFormReady || submitted}
                    title={!isFormReady ? "Veuillez remplir tous les champs obligatoires" : undefined}
                    className={`flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl transition-all text-sm tracking-wide ${
                      isFormReady && !submitted
                        ? "bg-orange-500 active:bg-orange-600 text-white shadow-lg shadow-orange-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {submitted ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Traitement...</>
                    ) : !isFormReady ? (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Remplissez le formulaire</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmer la commande</>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-[10px] text-gray-400">Paiement 100% sécurisé · Données protégées</p>
                  </div>
                </div>
              </div>
              <Link href="/panier" className="flex items-center justify-center gap-2 text-xs text-gray-500 font-semibold py-2 hover:text-slate-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour au panier
              </Link>
            </div>

          </div>
        </div>

        {/* ── Mobile sticky bottom bar ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 pt-3 pb-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          {/* Total row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Total à payer</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Livraison gratuite</span>
            </div>
            <span className="text-xl font-black text-orange-500">{total.toLocaleString("fr-FR")}€</span>
          </div>
          {/* Full-width button */}
          <button
            type="submit"
            disabled={!isFormReady || submitted}
            className={`flex items-center justify-center gap-2 w-full font-black py-3.5 rounded-2xl text-sm tracking-wide transition-all ${
              isFormReady && !submitted
                ? "bg-orange-500 active:bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitted ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Traitement...</>
            ) : !isFormReady ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Remplissez le formulaire</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmer la commande</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
