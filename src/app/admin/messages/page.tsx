"use client";

import { useEffect, useState, useCallback } from "react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

type FilterKey = "all" | "unread" | "read";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busy, setBusy] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const patch = useCallback(async (m: Message, read: boolean) => {
    setBusy(m.id);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, read }),
      });
      const updated = await res.json();
      setMessages((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setBusy(null);
    }
  }, []);

  const remove = useCallback(async (m: Message) => {
    if (!confirm("Supprimer ce message ?")) return;
    setBusy(m.id);
    try {
      await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      });
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setBusy(null);
    }
  }, []);

  const filtered = messages.filter((m) =>
    filter === "all" ? true : filter === "unread" ? !m.read : m.read
  );
  const counts = {
    all: messages.length,
    unread: messages.filter((m) => !m.read).length,
    read: messages.filter((m) => m.read).length,
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Messages reçus via le formulaire de contact.</p>
        </div>
        {counts.unread > 0 && (
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 font-bold text-sm px-3 py-1.5 rounded-xl self-start">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {counts.unread} non lu{counts.unread > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "all", label: "Tous", count: counts.all },
          { key: "unread", label: "Non lus", count: counts.unread },
          { key: "read", label: "Lus", count: counts.read },
        ] as { key: FilterKey; label: string; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors ${
              filter === t.key ? "bg-slate-950 text-white border-slate-950" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
          <div className="text-5xl mb-4">✉️</div>
          <p className="text-gray-500 font-semibold">Aucun message</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-5 ${m.read ? "border-gray-100" : "border-orange-200 ring-1 ring-orange-100"}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 text-sm">{m.name}</span>
                    {!m.read && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border text-orange-600 bg-orange-50 border-orange-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    <a href={`mailto:${m.email}`} className="hover:text-orange-500">{m.email}</a>
                    {m.phone ? ` · ` : ""}
                    {m.phone && <a href={`tel:${m.phone}`} className="hover:text-orange-500">{m.phone}</a>}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {m.subject && (
                <p className="text-sm font-bold text-gray-800 mt-3">{m.subject}</p>
              )}

              <div className="mt-2 bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("RE: " + (m.subject ?? "Votre message"))}`}
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Répondre
                </a>
                {m.read ? (
                  <button onClick={() => patch(m, false)} disabled={busy === m.id} className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Marquer non lu</button>
                ) : (
                  <button onClick={() => patch(m, true)} disabled={busy === m.id} className="text-xs bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Marquer lu</button>
                )}
                <button onClick={() => remove(m)} disabled={busy === m.id} className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ml-auto">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
