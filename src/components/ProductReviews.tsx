"use client";

import { useState } from "react";
import { ProductReview } from "@/lib/types";

function Stars({
  rating,
  interactive = false,
  size = "md",
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onSelect?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  const active = interactive && hovered > 0 ? hovered : rating;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${sz} transition-colors ${s <= active ? "text-yellow-400" : "text-gray-200"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onSelect?.(s)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductReviews({
  initialReviews,
  productName,
  productSlug,
}: {
  initialReviews: ProductReview[];
  productName: string;
  productSlug: string;
}) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ author: "", content: "", rating: 5 });
  const [errors, setErrors] = useState<{ author?: string; content?: string }>({});

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const validate = () => {
    const e: { author?: string; content?: string } = {};
    if (!form.author.trim()) e.author = "Votre prénom est requis.";
    if (form.content.trim().length < 10) e.content = "Votre avis doit faire au moins 10 caractères.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Erreur lors de l'envoi.");
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setForm({ author: "", content: "", rating: 5 });
      setShowForm(false);
      setSubmitted(true);
    } catch {
      setSubmitError("Impossible d'envoyer l'avis. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Avis clients</h2>
          <div className="w-12 h-1 bg-orange-500 rounded" />
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setSubmitted(false); }}
          className="flex items-center gap-2 bg-slate-950 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Écrire un avis
        </button>
      </div>

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-white rounded-lg p-6 border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <h3 className="text-lg font-black text-gray-900 mb-5">
            Votre avis sur{" "}
            <span className="text-orange-500">{productName}</span>
          </h3>

          {/* Star selector */}
          <div className="mb-5">
            <label className="text-sm font-bold text-gray-700 block mb-2">Note *</label>
            <div className="flex items-center gap-3">
              <Stars
                rating={form.rating}
                interactive
                size="lg"
                onSelect={(r) => setForm((f) => ({ ...f, rating: r }))}
              />
              <span className="text-sm text-gray-500 font-medium">
                {["", "Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"][form.rating]}
              </span>
            </div>
          </div>

          {/* Author */}
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-700 block mb-1.5">
              Prénom / Pseudo *
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="ex: Yassine M."
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition ${errors.author ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
            />
            {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
          </div>

          {/* Content */}
          <div className="mb-5">
            <label className="text-sm font-bold text-gray-700 block mb-1.5">
              Votre avis *
            </label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Partagez votre expérience avec ce produit..."
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition resize-none ${errors.content ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          <div className="flex gap-3 flex-col">
            {submitError && (
              <p className="text-xs text-red-500 font-semibold">{submitError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-950 hover:bg-orange-600 disabled:bg-slate-400 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
              >
                {submitting ? "Publication…" : "Publier mon avis"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-200 text-slate-600 font-bold text-sm px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      )}

      {submitted && (
        <div className="mb-8 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">Merci ! Votre avis a bien été envoyé et sera publié après validation.</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          Aucun avis pour ce produit. Soyez le premier à donner votre avis !
        </p>
      ) : (
        <div className="grid md:grid-cols-12 gap-10">
          {/* Summary */}
          <div className="md:col-span-3">
            <div className="sticky top-28">
              {/* Score card */}
              <div className="rounded-2xl overflow-hidden mb-4 shadow-[0_12px_32px_rgba(15,23,42,0.2)]">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-4">
                    {avg >= 4.5 ? "Excellent" : avg >= 4 ? "Très bien" : avg >= 3 ? "Bien" : "Moyen"}
                  </span>
                  <div className="flex items-end justify-center gap-1.5 mb-3">
                    <p className="text-7xl font-black text-white leading-none tracking-tight">{avg.toFixed(1)}</p>
                    <p className="text-xl font-bold text-slate-500 pb-2">/5</p>
                  </div>
                  <div className="flex justify-center mb-4">
                    <Stars rating={Math.round(avg)} size="md" />
                  </div>
                  <div className="border-t border-slate-700/50 pt-3">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      {reviews.length} avis client{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = reviews.filter((r) => r.rating === s).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-600 w-3 text-right shrink-0">{s}</span>
                      <svg className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct > 0 ? "linear-gradient(90deg, #f59e0b, #f97316)" : "transparent",
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-400 w-4 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review list */}
          <div className="md:col-span-9 space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-slate-200/80 rounded-lg p-5 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{review.author}</span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Achat vérifié
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="mt-1 mb-2">
                      <Stars rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                    {review.reply && (
                      <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg p-3">
                        <p className="text-[11px] font-black text-orange-600 uppercase tracking-wide mb-1">Réponse de ElectroShop-Tech</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
