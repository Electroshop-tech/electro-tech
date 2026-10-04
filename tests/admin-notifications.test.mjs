import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
const packageRequire = createRequire(import.meta.url);
function load(relative, mocks = {}) {
  const filename = path.resolve(relative);
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const resolve = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`, mocks);
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), `${name}.ts`), mocks);
    return packageRequire(name);
  };
  new Function("require", "module", "exports", code)(resolve, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const settingsRows = (enabled = true, channel = "sms") => [
  { key: "adminPhoneAlertsEnabled", value: String(enabled) }, { key: "adminPhoneAlertsNumber", value: "+33612345678" }, { key: "adminPhoneAlertsChannel", value: channel },
];
const notification = () => ({ id: "notice-1", phoneStatus: "PENDING", phoneTo: "+33612345678", phoneChannel: "sms",
  order: { id: "order-1", orderNumber: "MA123", total: 65, paymentCurrency: "EUR", paymentStatus: "UNPAID", paymentMethod: "stripe" } });
function database(row, rows = settingsRows()) {
  return { siteSetting: { findMany: async () => rows }, adminOrderNotification: {
    findUnique: async () => ({ ...row }),
    updateMany: async ({ where, data }) => { if (where.phoneStatus && row.phoneStatus !== where.phoneStatus) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    update: async ({ data }) => { Object.assign(row, data); return row; },
  } };
}
async function providerEnv(work) {
  const keys = ["JWT_SECRET", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_SMS_FROM", "TWILIO_WHATSAPP_FROM", "TWILIO_WHATSAPP_CONTENT_SID", "NEXT_PUBLIC_SITE_URL"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const oldFetch = globalThis.fetch;
  Object.assign(process.env, { JWT_SECRET: "test-only-secret-for-admin-notifications", TWILIO_ACCOUNT_SID: `AC${"1".repeat(32)}`, TWILIO_AUTH_TOKEN: "test-only", TWILIO_SMS_FROM: "+33123456789", NEXT_PUBLIC_SITE_URL: "https://example.com" });
  try { await work(); } finally { globalThis.fetch = oldFetch; for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
}

test("phone alerts default off and capture only the opted-in recipient for future events", async () => {
  let rows = [];
  const api = load("src/lib/admin-notifications.ts", { "@/lib/prisma": { siteSetting: { findMany: async () => rows } } });
  assert.equal((await api.notificationSeed("ORDER_CREATED")).phoneStatus, "DISABLED");
  rows = settingsRows();
  const seed = await api.notificationSeed("ORDER_CREATED");
  assert.equal(seed.phoneStatus, "PENDING"); assert.equal(seed.phoneTo, "+33612345678");
  rows = settingsRows(false);
  assert.equal((await api.notificationSeed("PAYMENT_RECEIVED")).phoneTo, null);
});

test("disabled alerts and changed recipients stop queued messages without contacting the provider", async () => {
  await providerEnv(async () => {
    globalThis.fetch = async () => assert.fail("Must not send");
    for (const rows of [settingsRows(false), settingsRows().map(r => r.key.endsWith("Number") ? { ...r, value: "+33712345678" } : r)]) {
      const row = notification(); const api = load("src/lib/admin-notifications.ts", { "@/lib/prisma": database(row, rows) });
      await api.dispatchPhoneAlert(row.id); assert.equal(row.phoneStatus, "DISABLED");
    }
  });
});

test("concurrent workers send only once and correctly label unpaid order alerts", async () => {
  await providerEnv(async () => {
    const row = notification(); let requests = 0; let sent;
    globalThis.fetch = async (url, options) => { requests++; sent = options.body; assert.ok(url.startsWith("https://api.twilio.com/")); return new Response(JSON.stringify({ sid: `SM${"2".repeat(32)}` }), { status: 201 }); };
    const api = load("src/lib/admin-notifications.ts", { "@/lib/prisma": database(row) });
    await Promise.all([api.dispatchPhoneAlert(row.id), api.dispatchPhoneAlert(row.id)]);
    assert.equal(requests, 1); assert.equal(row.phoneStatus, "ACCEPTED"); assert.ok(row.phoneAcceptedAt);
    assert.ok(sent.get("Body").includes("En attente de paiement")); assert.ok(sent.get("Body").includes("/admin/orders?order=order-1"));
    await api.dispatchPhoneAlert(row.id); assert.equal(requests, 1);
  });
});

test("definite provider rejection can be retried, but timeout results are never automatically duplicated", async () => {
  await providerEnv(async () => {
    const row = notification(); const api = load("src/lib/admin-notifications.ts", { "@/lib/prisma": database(row) });
    globalThis.fetch = async () => new Response("Rejected", { status: 401 });
    await api.dispatchPhoneAlert(row.id); assert.equal(row.phoneStatus, "FAILED");
    row.phoneStatus = "PENDING"; let requests = 0;
    globalThis.fetch = async () => { requests++; throw new Error("Timeout with unknown outcome"); };
    await api.dispatchPhoneAlert(row.id); assert.equal(row.phoneStatus, "UNKNOWN");
    await api.dispatchPhoneAlert(row.id); assert.equal(requests, 1);
  });
});

test("WhatsApp uses an approved template and paid order status rather than an unsolicited free-text message", async () => {
  await providerEnv(async () => {
    process.env.TWILIO_WHATSAPP_FROM = "whatsapp:+33123456789";
    process.env.TWILIO_WHATSAPP_CONTENT_SID = `HX${"3".repeat(32)}`;
    const row = { ...notification(), phoneChannel: "whatsapp" }; row.order.paymentStatus = "PAID";
    let sent;
    globalThis.fetch = async (url, options) => { sent = options.body; return new Response(JSON.stringify({ sid: `SM${"2".repeat(32)}` }), { status: 201 }); };
    const api = load("src/lib/admin-notifications.ts", { "@/lib/prisma": database(row, settingsRows(true, "whatsapp")) });
    await api.dispatchPhoneAlert(row.id);
    assert.equal(sent.get("To"), "whatsapp:+33612345678"); assert.ok(sent.get("ContentSid")); assert.equal(sent.get("Body"), null);
    assert.equal(JSON.parse(sent.get("ContentVariables"))["3"], "Paiement confirme - a traiter");
  });
});

test("notification APIs reject unauthenticated requests and staff cannot enable phone alerts", async () => {
  const { NextRequest } = packageRequire("next/server");
  const req = new NextRequest("http://localhost/api/admin/notifications");
  const api = load("src/app/api/admin/notifications/route.ts", { "@/lib/order-emails": {}, "@/lib/adminAuth": { isAdmin: async () => false, getAdminPayload: async () => null }, "@/lib/prisma": {}, "@/lib/rateLimit": { rateLimit: () => null } });
  assert.equal((await api.GET(req)).status, 401); assert.equal((await api.PATCH(req)).status, 401);
  const settings = load("src/app/api/admin/notifications/settings/route.ts", { "@/lib/adminAuth": { getAdminPayload: async () => ({ staffRole: "staff" }) }, "@/lib/prisma": {} });
  assert.equal((await settings.PUT(req)).status, 403);
});

test("order and dashboard notification are created in one nested database write", async () => {
  let captured;
  const data = { userId: "guest", customerName: "Client", customerEmail: "client@example.com", subtotal: 65, total: 65, status: "pending", paymentMethod: "stripe", address: { street: "Street", city: "City", postalCode: "1000", country: "France" }, items: [] };
  const api = load("src/lib/store.ts", {
    "./prisma": { $transaction: async work => work({ user: { upsert: async () => ({ id: "guest" }) }, order: { create: async ({ data }) => { captured = data; return { ...data, id: "order-1", createdAt: new Date(), updatedAt: new Date(), items: [] }; } } }) },
    "./product-images": { resolveProductImage: value => value },
    "next/cache": { unstable_cache: fn => fn },
    "@/lib/admin-notifications": { notificationSeed: async event => ({ event, phoneStatus: "DISABLED" }) },
  });
  for (const paymentMethod of ["stripe", "assisted"]) {
    await api.createOrder({ ...data, paymentMethod });
    assert.equal(captured.paymentMethod, paymentMethod);
    assert.equal(captured.paymentStatus, "UNPAID");
    assert.deepEqual(captured.adminNotifications, { create: { event: "ORDER_CREATED", phoneStatus: "DISABLED" } });
    assert.deepEqual(captured.emailDeliveries.create.map(row => row.kind), ["CUSTOMER_CONFIRMATION", "ADMIN_ORDER"]);
  }
});

test("new orders default to assisted payment and reject cash-on-delivery and arbitrary methods", () => {
  const { createOrderSchema } = load("src/lib/validation.ts");
  const input = { items: [{ productId: 1, quantity: 1, price: 65 }], address: { street: "Test", city: "Paris", postalCode: "75001", country: "France" }, customer: { firstName: "Test", lastName: "Client", phone: "0612345678", email: "client@example.com" } };
  assert.equal(createOrderSchema.parse(input).paymentMethod, "assisted");
  assert.equal(createOrderSchema.parse({ ...input, paymentMethod: "assisted" }).customer.phone, "+33612345678");
  assert.equal(createOrderSchema.parse({ ...input, paymentMethod: "stripe" }).paymentMethod, "stripe");
  for (const paymentMethod of ["cash_on_delivery", "cod", "paid", "arbitrary"]) assert.equal(createOrderSchema.safeParse({ ...input, paymentMethod }).success, false);
});

test("admin payment links enforce authentication, origin, provider configuration and order validation", async () => {
  const { NextRequest } = packageRequire("next/server");
  let admin = false, configured = true, creations = 0;
  const api = load("src/app/api/admin/orders/payment-link/route.ts", {
    "@/lib/adminAuth": { isAdmin: async () => admin }, "@/lib/rateLimit": { rateLimit: () => null },
    "@/lib/payments/stripe": { paymentConfigured: () => configured },
    "@/lib/payments/checkout": { createOrderCheckout: async id => { assert.equal(id, "order-1"); creations++; return "https://checkout.stripe.com/c/pay/test"; } },
  });
  const request = (body = { orderId: "order-1" }, origin = "http://localhost") => new NextRequest("http://localhost/api/admin/orders/payment-link", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
  assert.equal((await api.POST(request())).status, 401);
  admin = true;
  assert.equal((await api.POST(request(undefined, "https://other.example"))).status, 403);
  configured = false;
  assert.equal((await api.POST(request())).status, 503);
  configured = true;
  assert.equal((await api.POST(request({ orderId: "" }))).status, 400);
  assert.equal(creations, 0);
  const result = await api.POST(request());
  assert.equal(result.status, 200);
  assert.equal((await result.json()).url, "https://checkout.stripe.com/c/pay/test");
  assert.equal(creations, 1);
});

test("live admin feed rejects guests and publishes new orders without exposing customer details", async () => {
  const { NextRequest } = packageRequire("next/server");
  let admin = false, latest = "notice-1", unread = 1;
  const api = load("src/app/api/admin/notifications/stream/route.ts", {
    "@/lib/adminAuth": { isAdmin: async () => admin },
    "@/lib/prisma": { adminOrderNotification: { findFirst: async () => ({ id: latest }), count: async () => unread }, order: { findFirst: async () => ({ id: "order-1", updatedAt: new Date("2026-01-01") }) } },
  });
  const req = new NextRequest("http://localhost/api/admin/notifications/stream");
  assert.equal((await api.GET(req)).status, 401);
  admin = true;
  const response = await api.GET(req);
  assert.equal(response.headers.get("Content-Type"), "text/event-stream");
  assert.ok(response.headers.get("Cache-Control").includes("no-store"));
  const reader = response.body.getReader(), decoder = new TextDecoder();
  try {
    const initial = decoder.decode((await reader.read()).value);
    assert.ok(initial.includes("event: orders")); assert.ok(initial.includes("notice-1"));
    latest = "notice-2"; unread = 2;
    const changed = decoder.decode((await reader.read()).value);
    assert.ok(changed.includes("notice-2")); assert.ok(changed.includes(",2,"));
    assert.ok(!changed.includes("customer"));
  } finally { await reader.cancel(); }
});

test("assisted orders cannot be shipped until payment is confirmed", async () => {
  const { NextRequest } = packageRequire("next/server");
  let paid = false, updates = 0;
  const api = load("src/app/api/admin/orders/route.ts", {
    "@/lib/adminAuth": { isAdmin: async () => true }, "@/lib/prisma": {},
    "@/lib/store": {
      getOrderById: async () => ({ id: "order-1", paymentMethod: "assisted", paymentStatus: paid ? "paid" : "unpaid" }),
      updateOrder: async () => { updates++; return { id: "order-1" }; }, addAdminLog: async () => {},
    }, "@/lib/email": { sendOrderStatusEmail: async () => {} },
  });
  const request = status => new NextRequest("http://localhost/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id: "order-1", status }) });
  assert.equal((await api.PATCH(request("shipped"))).status, 409);
  assert.equal((await api.PATCH(request("delivered"))).status, 409);
  assert.equal(updates, 0);
  paid = true;
  assert.equal((await api.PATCH(request("shipped"))).status, 200);
  assert.equal(updates, 1);
});

test("phone activation is refused until provider and private session keys are configured", async () => {
  await providerEnv(async () => {
    delete process.env.JWT_SECRET;
    const { NextRequest } = packageRequire("next/server");
    const api = load("src/app/api/admin/notifications/settings/route.ts", { "@/lib/adminAuth": { getAdminPayload: async () => ({ staffRole: "owner" }) }, "@/lib/prisma": {} });
    const req = new NextRequest("http://localhost/api/admin/notifications/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: true, phone: "+33612345678", channel: "sms" }) });
    assert.equal((await api.PUT(req)).status, 503);
  });
});
