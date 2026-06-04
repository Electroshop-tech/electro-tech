"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, Characteristic, DescriptionSection, ProductReview, Category, Brand } from "@/lib/types";


type FormData = Omit<Product, "id">;

const EMPTY: FormData = {
  name: "", slug: "", description: "", category: "", brand: "",
  sku: "", condition: "Produit neuf", guarantee: "12 Mois", badge: "",
  originalPrice: 0, currentPrice: 0, inStock: true, stockQuantity: 0, isRefurbished: false,
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

/* ── Collapsible section ─────────────────────────────────────────────────── */
function Section({ title, count, children, defaultOpen = false }: { title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">{count}</span>}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

export default function ProductForm({ initial, productId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mainFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" }).then(r => r.json()).then(setCategories).catch(() => {});
    fetch("/api/admin/brands", { credentials: "include" }).then(r => r.json()).then(setBrands).catch(() => {});
  }, []);

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Image upload ──────────────────────────────────────────────────────────
  const uploadFiles = async (files: FileList, target: "main" | number) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    setUploadingIdx(target === "main" ? -1 : target);
    setError("");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload");
        return;
      }
      const urls: string[] = data.urls;
      setForm((prev) => {
        const imgs = [...(prev.images ?? [])];
        if (target === "main") {
          // First URL replaces slot 0 (or appends if empty); extra URLs are appended
          if (imgs.length === 0) {
            urls.forEach((u) => imgs.push(u));
          } else {
            imgs[0] = urls[0];
            urls.slice(1).forEach((u) => imgs.push(u));
          }
          return { ...prev, image: imgs[0], images: imgs };
        } else {
          const idx = target as number;
          urls.forEach((u, i) => {
            if (idx + i < imgs.length) imgs[idx + i] = u;
            else imgs.push(u);
          });
          return { ...prev, image: imgs[0] ?? prev.image, images: imgs };
        }
      });
    } catch {
      setError("Erreur lors de l'upload. Veuillez réessayer.");
    } finally {
      setUploadingIdx(null);
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.slug) { setError("Le nom et le slug sont requis."); return; }
    if (!form.currentPrice) { setError("Le prix actuel est requis."); return; }
    setSaving(true); setError(""); setSuccess("");
    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" }, credentials: "include",
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

  const removeImage = (i: number) => set("images", form.images!.filter((_, j) => j !== i));

  // ── Drag & drop reorder ─────────────────────────────────────────────────
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    const imgs = [...(form.images ?? [])];
    const [moved] = imgs.splice(dragIdx, 1);
    imgs.splice(targetIdx, 0, moved);
    set("images", imgs);
    if (imgs[0]) set("image", imgs[0]); // first image = main
    setDragIdx(null);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all bg-white";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";
  const xBtn = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

  const discount = form.originalPrice > form.currentPrice
    ? `-${Math.round((1 - form.currentPrice / form.originalPrice) * 100)}%`
    : null;

  return (
    <div className="max-w-3xl space-y-5">

      {/* ════════════════ 1. NAME + PRICE (the essentials) ════════════════ */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div>
          <label className={labelCls}>Nom du produit *</label>
          <input className={`${inputCls} text-base font-semibold`} value={form.name} onChange={(e) => {
            set("name", e.target.value);
            if (!productId) set("slug", slugify(e.target.value));
          }} placeholder="Ex: Android TV Box X96Q" />
          {form.slug && <p className="text-xs text-slate-400 mt-1">URL : /produits/<span className="text-orange-500">{form.slug}</span></p>}
        </div>

        <div>
          <label className={labelCls}>Description courte</label>
          <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description affichée dans les listes de produits..." />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Prix original (€)</label>
            <input type="number" className={inputCls} value={form.originalPrice || ""} onChange={(e) => set("originalPrice", e.target.value === "" ? 0 : Number(e.target.value))} onFocus={(e) => e.target.select()} placeholder="0" min={0} step={0.01} />
          </div>
          <div>
            <label className={labelCls}>Prix actuel (€) *</label>
            <input type="number" className={inputCls} value={form.currentPrice || ""} onChange={(e) => set("currentPrice", e.target.value === "" ? 0 : Number(e.target.value))} onFocus={(e) => e.target.select()} placeholder="0" min={0} step={0.01} />
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">— Choisir —</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Marque</label>
            <input className={inputCls} list="brands-list" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="X96, Mortal…" autoComplete="off" />
            <datalist id="brands-list">
              {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </datalist>
          </div>
        </div>
        {discount && (
          <p className="text-xs text-emerald-600 font-bold">Réduction calculée : {discount}</p>
        )}
      </div>

      {/* ════════════════ 2. IMAGES ════════════════ */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className={labelCls + " mb-0"}>Photos du produit</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Uploader
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadFiles(e.target.files, "main");
              e.target.value = "";
            }
          }} />
        <input ref={mainFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              // Append to end of gallery (or as main if no images yet)
              const target = form.images && form.images.length > 0 ? form.images.length : "main";
              uploadFiles(e.target.files, target);
              e.target.value = "";
            }
          }} />

        {/* Image grid */}
        <div className="flex flex-wrap gap-3">
          {(form.images ?? []).map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDragIdx(null)}
              className={`relative group w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border-2 transition-all cursor-grab active:cursor-grabbing ${dragIdx === i ? "border-orange-400 opacity-50 scale-95" : "border-gray-200 hover:border-orange-300"}`}
            >
              {img ? (
                <Image src={img} alt={`photo ${i + 1}`} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">vide</div>
              )}
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-orange-500/90 text-white text-[9px] font-bold text-center py-0.5">PRINCIPALE</span>}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {uploadingIdx === i && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
          {uploadingIdx === -1 && (
            <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Add button */}
          <button
            type="button"
            onClick={() => mainFileRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span className="text-[10px] font-bold mt-0.5">Photo</span>
          </button>
        </div>
        {(form.images ?? []).length === 0 && !uploadingIdx && (
          <p className="text-slate-400 text-xs text-center">Cliquez sur &quot;Uploader&quot; ou le bouton + pour ajouter des photos</p>
        )}
      </div>

      {/* ════════════════ 3. OPTIONS (toggles + badge) ════════════════ */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Quantité :</label>
            <input
              type="number"
              min="0"
              value={form.stockQuantity ?? 0}
              onChange={e => set("stockQuantity", Math.max(0, Number(e.target.value)))}
              className="w-20 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-center"
            />
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Badge :</span>
            <input className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-32 focus:outline-none focus:border-orange-400" value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} placeholder="-20%, Nouveau…" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">État :</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" value={form.condition ?? ""} onChange={(e) => set("condition", e.target.value)}>
              <option value="Produit neuf">Neuf</option>
              <option value="Reconditionné">Reconditionné</option>
              <option value="Occasion">Occasion</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Garantie :</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" value={form.guarantee ?? ""} onChange={(e) => set("guarantee", e.target.value)}>
              <option value="3 Mois">3 Mois</option>
              <option value="6 Mois">6 Mois</option>
              <option value="12 Mois">12 Mois</option>
              <option value="24 Mois">24 Mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* ════════════════ 4. OPTIONAL: Specs ════════════════ */}
      <Section title="Spécifications techniques" count={form.specs?.length}>
        <div className="space-y-2">
          {(form.specs ?? []).map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-400 text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
              <input className={`${inputCls} flex-1`} value={spec} onChange={(e) => updateSpec(i, e.target.value)} placeholder="Ex: RAM : 2 Go DDR3 | Stockage : 16 Go eMMC" />
              <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">{xBtn}</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSpec} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter une spécification</button>
      </Section>

      {/* ════════════════ 5. OPTIONAL: Characteristics ════════════════ */}
      <Section title="Caractéristiques (fiche produit)" count={form.characteristics?.length}>
        <div className="space-y-2">
          {(form.characteristics ?? []).map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input className={`${inputCls} sm:w-40 sm:flex-shrink-0`} value={c.label} onChange={(e) => updateChar(i, "label", e.target.value)} placeholder="Libellé (ex: RAM)" />
              <div className="flex items-center gap-2 flex-1">
                <input className={`${inputCls} flex-1`} value={c.value} onChange={(e) => updateChar(i, "value", e.target.value)} placeholder="Valeur (ex: 2 Go DDR3)" />
                <button onClick={() => removeChar(i)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">{xBtn}</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addChar} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter une caractéristique</button>
      </Section>

      {/* ════════════════ 6. OPTIONAL: Description Sections ════════════════ */}
      <Section title="Sections de description longue" count={form.descriptionSections?.length}>
        <div className="space-y-4">
          {(form.descriptionSections ?? []).map((s, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Section {i + 1}</span>
                <button onClick={() => removeSection(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">Supprimer</button>
              </div>
              <input className={inputCls} value={s.title} onChange={(e) => updateSection(i, "title", e.target.value)} placeholder="Titre de la section" />
              <textarea className={inputCls} rows={3} value={s.body} onChange={(e) => updateSection(i, "body", e.target.value)} placeholder="Corps du texte..." />
              <input className={inputCls} value={s.image} onChange={(e) => updateSection(i, "image", e.target.value)} placeholder="URL de l'image (optionnel)" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={s.imageRight ?? false} onChange={(e) => updateSection(i, "imageRight", e.target.checked)} className="accent-orange-500" />
                <span className="text-sm text-slate-600">Image à droite</span>
              </label>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSection} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter une section</button>
      </Section>

      {/* ════════════════ 7. OPTIONAL: Reviews ════════════════ */}
      <Section title="Avis clients" count={form.productReviews?.length}>
        <div className="space-y-4">
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
              <textarea className={inputCls} rows={2} value={r.content} onChange={(e) => updateReview(i, "content", e.target.value)} placeholder="Contenu de l'avis..." />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={r.verified ?? false} onChange={(e) => updateReview(i, "verified", e.target.checked)} className="accent-orange-500" />
                <span className="text-sm text-slate-600">Achat vérifié</span>
              </label>
            </div>
          ))}
        </div>
        <button type="button" onClick={addReview} className="text-xs text-orange-600 font-bold hover:underline">+ Ajouter un avis</button>
      </Section>

      {/* ════════════════ SEO ════════════════ */}
      <Section title="Référencement (SEO)">
        <div>
          <label className={labelCls}>Titre SEO (meta title)</label>
          <input
            className={inputCls}
            value={form.metaTitle ?? ""}
            onChange={(e) => set("metaTitle", e.target.value)}
            placeholder={form.name || "Titre affiché dans Google (50-60 caractères)"}
            maxLength={70}
          />
          <p className="text-xs text-slate-400 mt-1">{(form.metaTitle ?? "").length}/70 — laissez vide pour utiliser le nom du produit.</p>
        </div>
        <div>
          <label className={labelCls}>Description SEO (meta description)</label>
          <textarea
            className={inputCls}
            rows={3}
            value={form.metaDescription ?? ""}
            onChange={(e) => set("metaDescription", e.target.value)}
            placeholder={form.description || "Description affichée dans les résultats Google (150-160 caractères)"}
            maxLength={180}
          />
          <p className="text-xs text-slate-400 mt-1">{(form.metaDescription ?? "").length}/180 — laissez vide pour utiliser la description courte.</p>
        </div>
      </Section>

      {/* ════════════════ SAVE BAR ════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-2xl px-5 py-4 gap-3 sticky bottom-4 shadow-lg shadow-black/5">
        <div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          {success && <p className="text-emerald-600 text-sm font-semibold">{success}</p>}
        </div>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push("/admin/products")} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Enregistrement..." : productId ? "Mettre à jour" : "Créer le produit"}
          </button>
        </div>
      </div>
    </div>
  );
}
