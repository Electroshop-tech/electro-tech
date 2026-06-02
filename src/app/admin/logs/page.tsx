"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  action: string;
  detail: string;
  createdAt: string;
}

const ACTION_ICONS: Record<string, string> = {
  "product": "📦",
  "order": "🛍️",
  "settings": "⚙️",
  "newsletter": "📧",
  "delivery": "🚚",
  "promo": "🏷️",
  "category": "📁",
  "brand": "🏢",
  "hero": "🖼️",
};

function getIcon(action: string) {
  const prefix = action.split(".")[0];
  return ACTION_ICONS[prefix] ?? "📋";
}

function getActionColor(action: string) {
  if (action.includes("create")) return "bg-green-100 text-green-700 border-green-200";
  if (action.includes("delete")) return "bg-red-100 text-red-700 border-red-200";
  if (action.includes("update") || action.includes("status")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (action.includes("send")) return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Journal d&apos;activité</h1>
        <p className="text-gray-500 text-sm mt-1">Historique des actions administrateur</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-semibold">Aucune activité enregistrée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="text-2xl mt-0.5">{getIcon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{log.detail}</p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  <br />
                  {new Date(log.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
