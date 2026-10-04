/* Push-only worker: never cache authenticated admin pages or API responses. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("push", event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { /* Show a safe fallback. */ }
  event.waitUntil(self.registration.showNotification(data.title || "Nouvelle notification", {
    body: data.body || "Ouvrez le panneau administrateur pour consulter vos commandes.",
    icon: "/images/icon-192.png", badge: "/images/icon-192.png",
    tag: data.tag || "admin-order", renotify: false,
    data: { url: data.url || "/admin/notifications" },
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin/notifications", self.location.origin);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/admin/")) return;
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const tab = tabs.find(client => new URL(client.url).pathname.startsWith("/admin"));
    if (tab) { await tab.navigate(url.href); return tab.focus(); }
    return self.clients.openWindow(url.href);
  })());
});
