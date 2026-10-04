import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import vm from "node:vm";
const requirePackage = createRequire(import.meta.url);
function load(file, mocks) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", code)(name => name === "server-only" ? {} : Object.hasOwn(mocks, name) ? mocks[name] : requirePackage(name), module, module.exports);
  return module.exports;
}
const device = { id: "device", owner: "primary-owner", endpoint: "https://fcm.googleapis.com/fcm/send/test", p256dh: "key", auth: "auth", createdAt: new Date() };
const notice = { id: "notice", orderId: "order / 1", event: "ORDER_CREATED" };
function harness(sender = async () => {}) {
  let row = null;
  let devices = [device];
  const db = {
    adminUser: { findMany: async () => [] },
    adminPushSubscription: { findMany: async () => devices, deleteMany: async () => { devices = []; row = null; } },
    adminOrderNotification: { findMany: async () => row ? [] : [notice] },
    adminPushDelivery: {
      createMany: async () => { row ||= { id: "delivery", status: "PENDING", attempts: 0, notificationId: notice.id, subscriptionId: device.id, subscription: device, notification: notice, nextAttemptAt: new Date(0) }; },
      findMany: async () => row && row.status === "PENDING" && row.nextAttemptAt <= new Date() ? [{ ...row }] : [],
      updateMany: async ({ where, data }) => {
        if (!row || row.status !== where.status || (where.startedAt && (!row.startedAt || row.startedAt >= where.startedAt.lt))) return { count: 0 };
        for (const [key, value] of Object.entries(data)) row[key] = key === "attempts" ? row.attempts + value.increment : value;
        return { count: 1 };
      },
    },
  };
  const api = load("src/lib/admin-push.ts", { "@/lib/prisma": db, "web-push": { sendNotification: sender } });
  return { api, row: () => row, devices: () => devices };
}
const originalEnv = Object.fromEntries(["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"].map(k => [k, process.env[k]]));
Object.assign(process.env, { VAPID_PUBLIC_KEY: "test", VAPID_PRIVATE_KEY: "test", VAPID_SUBJECT: "mailto:admin@example.com" });
test.after(() => { for (const [key, value] of Object.entries(originalEnv)) value === undefined ? delete process.env[key] : process.env[key] = value; });

test("push destinations reject arbitrary HTTPS hosts and local addresses", () => {
  const { api } = harness();
  for (const endpoint of [device.endpoint, "https://web.push.apple.com/test", "https://updates.push.services.mozilla.com/test"]) assert.equal(api.validPushEndpoint(endpoint), true);
  for (const endpoint of ["http://fcm.googleapis.com/test", "https://127.0.0.1/test", "https://fcm.googleapis.com.evil.com/test", "https://fcm.googleapis.com:8443/test", "https://user:secret@fcm.googleapis.com/test"]) assert.equal(api.validPushEndpoint(endpoint), false);
});
test("orders persist in per-device outbox and concurrent workers send once", async () => {
  let calls = 0, payload;
  const h = harness(async (subscription, body, options) => { calls++; payload = JSON.parse(body); assert.equal(options.TTL, 604800); assert.equal(options.urgency, "high"); });
  await Promise.all([h.api.drainPushAlerts(), h.api.drainPushAlerts()]);
  assert.equal(calls, 1); assert.equal(h.row().status, "ACCEPTED"); assert.equal(payload.tag, notice.id);
  assert.equal(payload.url, "/admin/orders?order=order%20%2F%201"); assert.equal(payload.body.includes("customer"), false);
  await h.api.drainPushAlerts(); assert.equal(calls, 1);
});
test("temporary failures retry after backoff, preserving stable notification tag", async () => {
  let calls = 0;
  const h = harness(async () => { if (++calls === 1) throw { statusCode: 503 }; });
  await h.api.drainPushAlerts();
  assert.equal(h.row().status, "PENDING"); assert.equal(h.row().attempts, 1); assert.ok(h.row().nextAttemptAt > new Date());
  await h.api.drainPushAlerts(); assert.equal(calls, 1);
  h.row().nextAttemptAt = new Date(0); await h.api.drainPushAlerts(); assert.equal(calls, 2); assert.equal(h.row().status, "ACCEPTED");
});
test("expired subscriptions are removed and permanent refusals stop retrying", async () => {
  const expired = harness(async () => { throw { statusCode: 410 }; });
  await expired.api.drainPushAlerts(); assert.equal(expired.devices().length, 0);
  const refused = harness(async () => { throw { statusCode: 403 }; });
  await refused.api.drainPushAlerts(); assert.equal(refused.row().status, "FAILED");
  assert.equal(refused.api.pushFailure({ statusCode: 429 }), "PENDING"); assert.equal(refused.api.pushFailure(new Error("timeout")), "PENDING");
});
test("interrupted sends recover after their lease expires", async () => {
  const h = harness(); await h.api.drainPushAlerts();
  Object.assign(h.row(), { status: "SENDING", startedAt: new Date(Date.now() - 180000), nextAttemptAt: new Date(0) });
  await h.api.drainPushAlerts(); assert.equal(h.row().status, "ACCEPTED"); assert.equal(h.row().attempts, 2);
});
test("push APIs reject guests, ordinary staff, and foreign origins", async () => {
  const { NextRequest } = requirePackage("next/server"); let admin = null;
  const api = load("src/app/api/admin/notifications/push/route.ts", {
    "@/lib/adminAuth": { getAdminPayload: async () => admin }, "@/lib/prisma": {},
    "@/lib/admin-push": { validPushEndpoint: () => true, pushConfigured: () => true }, "@/lib/rateLimit": { rateLimit: () => null },
  });
  const req = new NextRequest("https://example.com/api/admin/notifications/push", { method: "POST", headers: { origin: "https://other.example" } });
  for (const method of [api.GET, api.POST, api.DELETE]) assert.equal((await method(req)).status, 401);
  admin = { staffRole: "staff" }; assert.equal((await api.POST(req)).status, 403);
  admin = { staffRole: "owner" }; assert.equal((await api.POST(req)).status, 403);
});
test("disabled staff devices are removed before sending order alerts", async () => {
  let sends = 0;
  const subscription = { ...device, owner: "disabled-staff" };
  const db = { adminUser: { findMany: async () => [] }, adminPushSubscription: {
    findMany: async () => [subscription], deleteMany: async ({ where }) => { assert.equal(where.id, device.id); },
  }, adminOrderNotification: { findMany: async () => assert.fail("Must not queue for revoked staff") },
  adminPushDelivery: { updateMany: async () => ({ count: 0 }), findMany: async () => [] } };
  const api = load("src/lib/admin-push.ts", { "@/lib/prisma": db, "web-push": { sendNotification: async () => sends++ } });
  await api.drainPushAlerts(); assert.equal(sends, 0);
});
test("service worker displays pushes without an open page and refuses offsite clicks", async () => {
  const listeners = {}; let shown, opened; const self = { location: { origin: "https://example.com" },
    addEventListener: (name, callback) => { listeners[name] = callback; },
    registration: { showNotification: async (...args) => { shown = args; } },
    clients: { matchAll: async () => [], openWindow: async url => { opened = url; } },
  };
  vm.runInNewContext(fs.readFileSync("public/admin-sw.js", "utf8"), { self, URL });
  let pending; const waitUntil = promise => { pending = promise; };
  listeners.push({ data: { json: () => ({ title: "Order", tag: "unique", url: "/admin/orders?order=1" }) }, waitUntil }); await pending;
  assert.equal(shown[1].tag, "unique");
  listeners.notificationclick({ notification: { close() {}, data: { url: "/admin/orders?order=1" } }, waitUntil }); await pending;
  assert.equal(opened, "https://example.com/admin/orders?order=1"); opened = null;
  listeners.notificationclick({ notification: { close() {}, data: { url: "https://evil.example/admin/orders" } }, waitUntil }); assert.equal(opened, null);
});
