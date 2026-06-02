"use client";

import { useEffect, useState, useCallback } from "react";

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    sent: number;
    failed: number;
    totalSubscribers: number;
  } | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      setSubscribers(data.subscribers ?? []);
    } catch {
      console.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  async function handleDelete(email: string) {
    if (!confirm(`Supprimer ${email} de la newsletter ?`)) return;
    setDeleting(email);
    try {
      await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubscribers((prev) => prev.filter((s) => s.email !== email));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    if (
      !confirm(
        `Envoyer cette newsletter à ${subscribers.length} abonné(s) ?\n\nSujet : ${subject}`
      )
    )
      return;

    setSending(true);
    setSendResult(null);
    try {
      // Convert image to base64 if present
      let imageBase64: string | null = null;
      let imageMimeType: string | null = null;
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageMimeType = imageFile.type;
      }

      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          ...(imageBase64 ? { imageBase64, imageMimeType } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult(data);
        setSubject("");
        setBody("");
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert(data.error ?? "Erreur lors de l'envoi");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Newsletter</h1>
          <p className="text-gray-500 text-sm mt-1">
            {subscribers.length} abonné{subscribers.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          onClick={() => {
            setShowCompose(!showCompose);
            setSendResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            showCompose
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/25"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {showCompose ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            )}
          </svg>
          {showCompose ? "Fermer" : "Envoyer une newsletter"}
        </button>
      </div>

      {/* Compose panel */}
      {showCompose && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Composer une newsletter
              </h3>
              <p className="text-xs text-gray-500">
                L&apos;email sera envoyé à{" "}
                <strong className="text-orange-500">{subscribers.length}</strong>{" "}
                abonné{subscribers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {sendResult && (
            <div
              className={`rounded-xl p-4 border text-sm ${
                sendResult.failed === 0
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-yellow-50 border-yellow-200 text-yellow-700"
              }`}
            >
              <p className="font-bold">
                {sendResult.failed === 0
                  ? "✅ Newsletter envoyée avec succès !"
                  : "⚠️ Envoi partiellement réussi"}
              </p>
              <p className="text-xs mt-1">
                {sendResult.sent} envoyé{sendResult.sent !== 1 ? "s" : ""} sur{" "}
                {sendResult.totalSubscribers} ·{" "}
                {sendResult.failed > 0
                  ? `${sendResult.failed} échec(s)`
                  : "Aucun échec"}
              </p>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Sujet de l&apos;email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: 🔥 Nouvelles offres de la semaine !"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Contenu du message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Bonjour,&#10;&#10;Découvrez nos nouvelles offres exclusives...&#10;&#10;L'équipe ElectroShop-Tech"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-y"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Chaque ligne sera un paragraphe séparé. Le template email
                ElectroShop-Tech sera appliqué automatiquement.
              </p>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Image (optionnel)
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="max-h-48 rounded-xl border border-gray-200 object-contain bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-6 px-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-all">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M16.5 3.75a.75.75 0 00-.75.75v.008l.008-.008A.75.75 0 0016.5 3.75z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-400">Cliquer pour ajouter une image</span>
                  <span className="text-[11px] text-gray-300">PNG, JPG, WebP — max 5 Mo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert("Image trop grande (max 5 Mo)");
                        return;
                      }
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={sending || !subject.trim() || !body.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Envoyer à {subscribers.length} abonné
                  {subscribers.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un abonné..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
        />
      </div>

      {/* Subscribers list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-gray-500 font-semibold">
            {search ? "Aucun abonné trouvé" : "Aucun abonné pour le moment"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Les visiteurs peuvent s&apos;inscrire via le formulaire en bas de page.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Date d&apos;inscription
                </th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub) => (
                <tr key={sub.email} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-xs">
                        {sub.email[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {sub.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {new Date(sub.subscribedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.email)}
                      disabled={deleting === sub.email}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {deleting === sub.email ? "…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
