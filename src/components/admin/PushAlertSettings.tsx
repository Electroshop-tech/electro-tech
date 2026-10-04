"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Status = { configured: boolean; publicKey: string | null; subscribed: boolean; failed: number; pending: number };
const endpoint = "/api/admin/notifications/push";
const subscribeCapabilities = () => () => {};
function capabilities() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  if (ios && !standalone) return "install-ios";
  return window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window ? "supported" : "unsupported";
}

async function responseData(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Service indisponible. Réessayez.");
  return data;
}

export default function PushAlertSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const support = useSyncExternalStore(subscribeCapabilities, capabilities, () => "loading");
  const supported = support === "supported";
  const installIOS = support === "install-ios";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const registration = await navigator.serviceWorker.getRegistration("/admin/");
    const sub = await registration?.pushManager.getSubscription();
    const data = await responseData(await fetch(`${endpoint}${sub ? `?endpoint=${encodeURIComponent(sub.endpoint)}` : ""}`, { cache: "no-store" }));
    setStatus(data);
  }

  useEffect(() => {
    if (!supported) return;
    const update = () => { if (!document.hidden) refresh().catch(error => setMessage(error.message)); };
    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [supported]);

  async function act(action: "subscribe" | "test" | "disable") {
    setBusy(true); setMessage("");
    try {
      if (action === "subscribe" && await Notification.requestPermission() !== "granted") throw new Error("Autorisez les notifications dans les réglages de votre navigateur pour recevoir les commandes.");
      const registration = await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/", updateViaCache: "none" });
      // Wait for this admin-scoped worker, not a different site's root worker.
      if (!registration.active) await new Promise<void>((resolve, reject) => {
        const worker = registration.installing || registration.waiting;
        if (!worker) return reject(new Error("Service de notifications indisponible."));
        const timeout = window.setTimeout(() => reject(new Error("Activation trop longue. Réessayez.")), 15000);
        worker.addEventListener("statechange", () => { if (worker.state === "activated") { clearTimeout(timeout); resolve(); } });
      });
      let sub = await registration.pushManager.getSubscription();
      if (action === "disable") {
        if (sub) {
          await responseData(await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }));
          await sub.unsubscribe();
        }
        setMessage("Notifications désactivées sur cet appareil.");
      } else {
        if (!sub && action === "subscribe") {
          if (!status?.publicKey) throw new Error("Service non configuré.");
          const raw = atob(status.publicKey.replace(/-/g, "+").replace(/_/g, "/"));
          const key = Uint8Array.from(raw, char => char.charCodeAt(0));
          sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        }
        if (!sub) throw new Error("Activez d’abord cet appareil.");
        await responseData(await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, subscription: sub.toJSON() }) }));
        setMessage(action === "test" ? "Test accepté par le service push. Vérifiez les notifications de votre téléphone." : "Cet appareil recevra les prochaines commandes, même lorsque le panneau est fermé.");
      }
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Activation impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
    <div><h2 className="font-bold text-slate-900">Notifications sur ce téléphone</h2><p className="text-sm text-slate-500 mt-2">Recevez chaque nouvelle commande et paiement confirmé, même si le panneau administrateur est fermé.</p></div>
    {installIOS && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">Sur iPhone (iOS 16.4 ou plus), ouvrez le site dans Safari, puis Partager → Sur l’écran d’accueil. Ouvrez ensuite l’application installée pour activer les notifications.</p>}
    {support === "unsupported" && <p className="text-sm text-slate-600">Ouvrez le site en HTTPS dans un navigateur compatible avec les notifications.</p>}
    {supported && status && <>
      <p className="text-sm font-semibold text-slate-700">{status.subscribed ? "Activées sur cet appareil" : "Non activées sur cet appareil"}</p>
      {!status.configured && <p className="text-sm text-amber-700">Le service de notifications n’est pas encore configuré sur le serveur.</p>}
      {status.failed > 0 && <p className="text-sm text-red-700">{status.failed} envoi(s) refusé(s). Contactez le responsable du site pour vérifier le service.</p>}
      {status.pending > 0 && <p className="text-sm text-slate-500">{status.pending} notification(s) en attente d’envoi.</p>}
      <div className="flex flex-wrap gap-2">{!status.subscribed ? <button disabled={busy || !status.configured || installIOS} onClick={() => act("subscribe")} className="rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-bold disabled:opacity-50">Activer sur cet appareil</button> : <>
        <button disabled={busy || !status.configured} onClick={() => act("test")} className="rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-bold disabled:opacity-50">Envoyer un test</button>
        <button disabled={busy} onClick={() => act("disable")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-50">Désactiver</button>
      </>}</div>
    </>}
    <p role="status" className="text-sm text-slate-600">{busy ? "En cours…" : message}</p>
    <p className="text-xs text-slate-500">Gardez les notifications autorisées dans les réglages du téléphone. Les commandes restent toujours disponibles dans ce panneau.</p>
  </section>;
}
