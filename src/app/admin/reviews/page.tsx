"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminReview {
  id: number;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified?: boolean;
  approved?: boolean;
  reply?: string;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  status: "pending" | "approved" | "legacy";
}

type FilterKey = "all" | "pending" | "approved";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [busy, setBusy] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const patch = useCallback(async (r: AdminReview, action: string, reply?: string) => {
    setBusy(r.id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: r.productId, reviewId: r.id, action, reply }),
      });
      await fetchReviews();
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setBusy(null);
    }
  }, [fetchReviews]);

  const remove = useCallback(async (r: AdminReview) => {
    if (!confirm(`Supprimer définitivement l'avis de ${r.author} ?`)) return;
    setBusy(r.id);
    try {
      await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: r.productId, reviewId: r.id }),
      });
      setReviews((prev) => prev.filter((x) => !(x.id === r.id && x.productId === r.productId)));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setBusy(null);
    }
  }, []);

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "approved") return r.status === "approved" || r.status === "legacy";
    return true;
  });

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status !== "pending").length,
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Avis clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modérez, répondez et gérez les avis produits.</p>
        </div>
        {counts.pending > 0 && (
          <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 font-bold text-sm px-3 py-1.5 rounded-xl self-start">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {counts.pending} en attente de validation
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "pending", label: "En attente", count: counts.pending },
          { key: "approved", label: "Publiés", count: counts.approved },
          { key: "all", label: "Tous", count: counts.all },
        ] as { key: FilterKey; label: string; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors ${
              filter === t.key
                ? "bg-slate-950 text-white border-slate-950"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label} <span className={filter === t.key ? "text-orange-400" : "text-gray-400"}>({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-gray-500 font-semibold">Aucun avis dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={`${r.productId}-${r.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.productImage} alt={r.productName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <a href={`/produits/${r.productSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:underline truncate block">
                        {r.productName}
                      </a>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{r.author}</span>
                        <Stars rating={r.rating} />
                        {r.status === "pending" && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">En attente</span>
                        )}
                        {r.status === "approved" && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Publié</span>
                        )}
                        {r.status === "legacy" && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Visible</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{r.date}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mt-2">{r.content}</p>

                  {r.reply && replyingId !== r.id && (
                    <div className="mt-2 bg-orange-50 border border-orange-100 rounded-lg p-3">
                      <p className="text-[11px] font-black text-orange-600 uppercase tracking-wide mb-0.5">Votre réponse</p>
                      <p className="text-sm text-gray-700">{r.reply}</p>
                    </div>
                  )}

                  {replyingId === r.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        placeholder="Votre réponse publique..."
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => { patch(r, "reply", replyText); setReplyingId(null); }}
                          disabled={busy === r.id}
                          className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Enregistrer la réponse
                        </button>
                        <button
                          onClick={() => setReplyingId(null)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {replyingId !== r.id && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => patch(r, "approve")}
                          disabled={busy === r.id}
                          className="inline-flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Approuver
                        </button>
                      ) : (
                        <button
                          onClick={() => patch(r, "reject")}
                          disabled={busy === r.id}
                          className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          Masquer
                        </button>
                      )}
                      <button
                        onClick={() => { setReplyingId(r.id); setReplyText(r.reply ?? ""); }}
                        className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a4 4 0 014 4v6m-7-7l-3-3 3-3" /></svg>
                        {r.reply ? "Modifier la réponse" : "Répondre"}
                      </button>
                      <button
                        onClick={() => remove(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 text-xs bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
