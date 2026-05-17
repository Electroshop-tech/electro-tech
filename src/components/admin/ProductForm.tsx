"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, Characteristic, DescriptionSection, ProductReview } from "@/lib/types";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin1234";

const TABS = [
  { id: "basic", label: "Infos de base" },
  { id: "images", label: "Images" },
  { id: "specs", label: "Spécifications" },
  { id: "chars", label: "Caractéristiques" },
  { id: "sections", label: "Sections description" },
  { id: "reviews", label: "Avis clients" },
];

type FormData = Omit<Product, "id">;

const EMPTY: FormData = {
  name: "", slug: "", description: "", category: "", brand: "",
  sku: "", condition: "Produit neuf", guarantee: "12 Mois", badge: "",
  originalPrice: 0, currentPrice: 0, inStock: true, isRefurbished: false,
  image: "", images: [], specs: [], characteristics: [],
  descriptionSections: [], productReviews: [],
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  initial?: Partial<Product>;
  productId?: number;
}

export default function ProductForm({ initial, productId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mainFileRef = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Image upload ──────────────────────────────────────────────────────────
  const uploadFiles = async (files: FileList, target: "main" | number) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    setUploadingIdx(target === "main" ? -1 : target);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-key": ADMIN_KEY },
      body: fd,
    });
    const { urls } = await res.json();
    if (target === "main") {
      set("image", urls[0]);
      set("images", form.images?.length ? [urls[0], ...form.images.slice(1)] : [urls[0]]);
    } else {
      const imgs = [...(form.images ?? [])];
      urls.forEach((u: string, i: number) => {
        if (target + i < imgs.length) imgs[target + i] = u;
        else imgs.push(u);
      });
      set("images", imgs);
    }
    setUploadingIdx(null);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.slug) { setError("Le nom et le slug sont requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "x-admin-key": ADMIN_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(productId ? { ...form, id: productId } : form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(productId ? "Produit mis à jour !" : "Produit créé avec succès !");
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addSpec = () => set("specs", [...(form.specs ?? []), ""]);
  const removeSpec = (i: number) => set("specs", form.specs!.filter((_, j) => j !== i));
  const updateSpec = (i: number, v: string) => {
    const s = [...(form.specs ?? [])]; s[i] = v; set("specs", s);
  };

  const addChar = () => set("characteristics", [...(form.characteristics ?? []), { label: "", value: "" }]);
  const removeChar = (i: number) => set("characteristics", form.characteristics!.filter((_, j) => j !== i));
  const updateChar = (i: number, key: keyof Characteristic, v: string) => {
    const c = [...(form.characteristics ?? [])]; c[i] = { ...c[i], [key]: v }; set("characteristics", c);
  };

  const addSection = () => set("descriptionSections", [...(form.descriptionSections ?? []), { title: "", body: "", image: "", imageRight: false }]);
  const removeSection = (i: number) => set("descriptionSections", form.descriptionSections!.filter((_, j) => j !== i));
  const updateSection = (i: number, key: keyof DescriptionSection, v: string | boolean) => {
    const s = [...(form.descriptionSections ?? [])]; s[i] = { ...s[i], [key]: v }; set("descriptionSections", s);
  };

  const addReview = () => set("productReviews", [...(form.productReviews ?? []), {
    id: Date.now(), author: "", rating: 5, date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), content: "", verified: true,
  }]);
  const removeReview = (i: number) => set("productReviews", form.productReviews!.filter((_, j) => j !== i));
  const updateReview = (i: number, key: keyof ProductReview, v: string | number | boolean) => {
    const r = [...(form.productReviews ?? [])]; r[i] = { ...r[i], [key]: v }; set("productReviews", r);
  };

  const addImage = () => set("images", [...(form.images ?? []), ""]);
  const removeImage = (i: number) => set("images", form.images!.filter((_, j) => j !== i));
  const updateImage = (i: number, v: string) => {
    const imgs = [...(form.images ?? [])]; imgs[i] = v; set("images", imgs);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all bg-white";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

  return (
    <div className="max-w-4xl space-y-5">
      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* ── TAB: Basic Info ── */}
        {tab === "basic" && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nom du produit *</label>
                <input className={inputCls} value={form.name} onChange={(e) => {
                  set("name", e.target.value);
                  if (!productId) set("slug", slugify(e.target.value));
                }} placeholder="Ex: Android TV Box X96Q" />
              </div>
              <div>
                <label className={labelCls}>Slug (URL) *</label>
                <input className={inputCls} value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="android-tv-box-x96q" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description courte</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description affichée sur les listes produits..." />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Catégorie</label>
                <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="passerelle-multimedia" />
              </div>
              <div>
                <label className={labelCls}>Marque</label>
                <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="X96" />
              </div>
              <div>
                <label className={labelCls}>SKU / Référence</label>
                <input className={inputCls} value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} placeholder="X96Q-2G16G" />
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Prix original (€)</label>
                <input type="number" className={inputCls} value={form.originalPrice} onChange={(e) => set("originalPrice", Number(e.target.value))} min={0} step={0.01} />
              </div>
              <div>
                <label className={labelCls}>Prix actuel (€)</label>
                <input type="number" className={inputCls} value={form.currentPrice} onChange={(e) => set("currentPrice", Number(e.target.value))} min={0} step={0.01} />
              </div>
              <div>
                <label className={labelCls}>État</label>
                <select className={inputCls} value={form.condition ?? ""} onChange={(e) => set("condition", e.target.value)}>
                  <option value="Produit neuf">Produit neuf</option>
                  <option value="Reconditionné">Reconditionné</option>
                  <option value="Occasion">Occasion</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Garantie</label>
                <select className={inputCls} value={form.guarantee ?? ""} onChange={(e) => set("guarantee", e.target.value)}>
                  <option value="3 Mois">3 Mois</option>
                  <option value="6 Mois">6 Mois</option>
                  <option value="12 Mois">12 Mois</option>
                  <option value="24 Mois">24 Mois</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Badge (optionnel)</label>
                <input className={inputCls} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} placeholder="Ex: -20%, Nouveau, Best Seller" />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set("inStock", !form.inStock)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.inStock ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.inStock ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-semibold text-slate-700">En stock</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set("isRefurbished", !form.isRefurbished)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isRefurbished ? "bg-orange-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isRefurbished ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-semibold text-slate-700">Reconditionné</span>
              </label>
            </div>
          </>
        )}

        {/* ── TAB: Images ── */}
        {tab === "images" && (
          <>
            <div>
              <label className={labelCls}>Image principale</label>
              <div className="flex gap-3 items-start">
                <input className={`${inputCls} flex-1`} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/products/mon-produit/1.jpg" />
                <button
                  type="button"
                  onClick={() => mainFileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-gray-50 whitespace-nowrap"
                >
                  {uploadingIdx === -1 ? (
                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  Uploader
                </button>
                <input ref={mainFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files, "main")} />
              </div>
              {form.image && (
                <div className="mt-3 w-32 h-32 bg-gray-100 rounded-xl overflow-hidden relative">
                  <Image src={form.image} alt="preview" fill className="object-cover" sizes="128px" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls}>Galerie d&apos;images</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Uploader plusieurs
                  </button>
                  <button type="button" onClick={addImage} className="text-xs text-blue-600 font-bold hover:underline">+ Ajouter URL</button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && uploadFiles(e.target.files, form.images?.length ?? 0)} />
              <div className="space-y-2">
                {(form.images ?? []).map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {img && <Image src={img} alt={`img-${i}`} fill className="object-cover" sizes="40px" />}
                    </div>
                    <input
                      className={`${inputCls} flex-1`}
                      value={img}
                      onChange={(e) => updateImage(i, e.target.value)}
                      placeholder={`/products/mon-produit/${i + 1}.jpg`}
                    />
                    {uploadingIdx === i && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />}
                    <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {(form.images ?? []).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl">
                    Aucune image dans la galerie. Ajoutez des URLs ou uploadez des fichiers.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── TAB: Specs ── */}
        {tab === "specs" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelCls}>Spécifications techniques</label>
              <button type="button" onClick={addSpec} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {(form.specs ?? []).map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                  <input
                    className={`${inputCls} flex-1`}
                    value={spec}
                    onChange={(e) => updateSpec(i, e.target.value)}
                    placeholder="Ex: RAM : 2 Go DDR3 | Stockage : 16 Go eMMC"
                  />
                  <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {(form.specs ?? []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl">Aucune spécification. Cliquez sur &quot;+ Ajouter&quot;.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Characteristics ── */}
        {tab === "chars" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelCls}>Caractéristiques (tableau fiche produit)</label>
              <button type="button" onClick={addChar} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {(form.characteristics ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${inputCls} w-44 flex-shrink-0`}
                    value={c.label}
                    onChange={(e) => updateChar(i, "label", e.target.value)}
                    placeholder="Ex: RAM"
                  />
                  <input
                    className={`${inputCls} flex-1`}
                    value={c.value}
                    onChange={(e) => updateChar(i, "value", e.target.value)}
                    placeholder="Ex: 2 Go DDR3"
                  />
                  <button onClick={() => removeChar(i)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {(form.characteristics ?? []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl">Aucune caractéristique.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Description Sections ── */}
        {tab === "sections" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelCls}>Sections de description longue</label>
              <button type="button" onClick={addSection} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter section</button>
            </div>
            <div className="space-y-5">
              {(form.descriptionSections ?? []).map((s, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Section {i + 1}</span>
                    <button onClick={() => removeSection(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">Supprimer</button>
                  </div>
                  <input
                    className={inputCls}
                    value={s.title}
                    onChange={(e) => updateSection(i, "title", e.target.value)}
                    placeholder="Titre de la section"
                  />
                  <textarea
                    className={inputCls}
                    rows={4}
                    value={s.body}
                    onChange={(e) => updateSection(i, "body", e.target.value)}
                    placeholder="Corps du texte (utilisez \n\n pour les paragraphes)"
                  />
                  <input
                    className={inputCls}
                    value={s.image}
                    onChange={(e) => updateSection(i, "image", e.target.value)}
                    placeholder="URL de l'image (/products/...)"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.imageRight ?? false}
                      onChange={(e) => updateSection(i, "imageRight", e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-slate-600">Image à droite</span>
                  </label>
                </div>
              ))}
              {(form.descriptionSections ?? []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl">Aucune section.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Reviews ── */}
        {tab === "reviews" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelCls}>Avis clients</label>
              <button type="button" onClick={addReview} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter un avis</button>
            </div>
            <div className="space-y-5">
              {(form.productReviews ?? []).map((r, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Avis {i + 1}</span>
                    <button onClick={() => removeReview(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">Supprimer</button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input className={inputCls} value={r.author} onChange={(e) => updateReview(i, "author", e.target.value)} placeholder="Nom (ex: Yassine M.)" />
                    <input className={inputCls} value={r.date} onChange={(e) => updateReview(i, "date", e.target.value)} placeholder="Ex: 12 mai 2026" />
                    <select className={inputCls} value={r.rating} onChange={(e) => updateReview(i, "rating", Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <textarea className={inputCls} rows={3} value={r.content} onChange={(e) => updateReview(i, "content", e.target.value)} placeholder="Contenu de l'avis..." />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r.verified ?? false}
                      onChange={(e) => updateReview(i, "verified", e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-slate-600">Achat vérifié</span>
                  </label>
                </div>
              ))}
              {(form.productReviews ?? []).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl">Aucun avis.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          {success && <p className="text-emerald-600 text-sm font-semibold">{success}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Enregistrement..." : productId ? "Mettre à jour" : "Créer le produit"}
          </button>
        </div>
      </div>
    </div>
  );
}
