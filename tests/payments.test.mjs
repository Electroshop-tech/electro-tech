import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import Stripe from "stripe";

const packageRequire = createRequire(import.meta.url);
const root = process.cwd();
// Load the real TypeScript services while substituting external IO only.
function load(relative, mocks = {}, cache = new Map()) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename);
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule.exports);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const resolve = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`, mocks, cache);
    if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), `${name}.ts`)), mocks, cache);
    return packageRequire(name);
  };
  new Function("require", "module", "exports", source)(resolve, loadedModule, loadedModule.exports);
  cache.set(filename, loadedModule.exports);
  return loadedModule.exports;
}

const validation = load("src/lib/payments/validation.ts");
const validSession = () => ({ id: "cs_test_1", mode: "payment", status: "complete", payment_status: "paid", amount_total: 5500,
  currency: "eur", client_reference_id: "order-1", metadata: { orderId: "order-1", checkoutGeneration: "generation-1" }, payment_intent: "pi_test_1" });
const expected = { orderId: "order-1", amount: 5500, currency: "EUR", generation: "generation-1", sessionId: "cs_test_1" };

test("money conversion rejects invalid totals and preserves cents", () => {
  assert.equal(validation.amountInCents(55), 5500);
  assert.equal(validation.amountInCents(12.34), 1234);
  for (const amount of [0, -1, NaN, Infinity, .01]) assert.throws(() => validation.amountInCents(amount));
});

test("payment validation rejects unpaid, wrong amount, currency, order, session and missing reference", () => {
  assert.equal(validation.validatePaidSession(validSession(), expected), "pi_test_1");
  for (const patch of [{ payment_status: "unpaid" }, { amount_total: 1 }, { currency: "usd" }, { id: "cs_other" },
    { client_reference_id: "other" }, { metadata: { orderId: "other", checkoutGeneration: "generation-1" } },
    { metadata: { orderId: "order-1", checkoutGeneration: "other" } }, { payment_intent: null }, { status: "open" }]) {
    assert.throws(() => validation.validatePaidSession({ ...validSession(), ...patch }, expected));
  }
});

test("concurrent clicks reuse one Stripe idempotency key and database amount", async () => {
  const order = { id: "order-1", total: 55, paymentStatus: "UNPAID", status: "PENDING", customerEmail: "client@example.com", paymentCurrency: "EUR" };
  const checkout = { orderId: order.id, generation: "generation-1", amount: 5500, currency: "EUR", sessionId: null, createdAt: new Date() };
  const requests = [];
  const prisma = { order: { findUnique: async () => order }, paymentCheckout: {
    upsert: async () => ({ ...checkout }), updateMany: async ({ data }) => { Object.assign(checkout, data); return { count: 1 }; },
  } };
  prisma.$transaction = async fn => fn({ ...prisma, $queryRaw: async () => [] });
  const api = load("src/lib/payments/checkout.ts", { "@/lib/prisma": prisma, "./stripe": {
    paymentSiteUrl: () => "https://example.com", getStripe: () => ({ checkout: { sessions: {
      create: async (params, options) => { requests.push({ params, options }); return { id: "cs_test_1", url: "https://checkout.stripe.com/test" }; },
    } } }),
  } });
  const urls = await Promise.all([api.createOrderCheckout(order.id), api.createOrderCheckout(order.id)]);
  assert.equal(urls[0], urls[1]);
  assert.equal(new Set(requests.map(r => r.options.idempotencyKey)).size, 1);
  for (const request of requests) { assert.equal(request.params.line_items[0].price_data.unit_amount, 5500); assert.equal(request.params.metadata.orderId, order.id); }
  order.paymentStatus = "PAID";
  await assert.rejects(api.createOrderCheckout(order.id));
  assert.equal(requests.length, 2);
});

test("repeated webhooks do not rewrite paidAt or process payment twice", async () => {
  const session = validSession();
  const order = { id: "order-1", total: 55, paymentCurrency: "EUR", paymentStatus: "UNPAID", status: "PENDING",
    checkout: { amount: 5500, currency: "EUR", generation: "generation-1", sessionId: "cs_test_1" } };
  const events = new Map(); let writes = 0;
  const tx = { $queryRaw: async () => [], order: {
    findUnique: async () => order, update: async ({ data }) => { Object.assign(order, data); writes++; },
  }, paymentWebhookEvent: { findUnique: async ({ where }) => events.get(where.id), create: async ({ data }) => events.set(data.id, data) } };
  const api = load("src/lib/payments/webhook.ts", { "@/lib/prisma": { $transaction: async fn => fn(tx) },
    "@/lib/admin-notifications": { notificationSeed: async event => ({ event, phoneStatus: "DISABLED" }) },
    "./stripe": { getStripe: () => ({ checkout: { sessions: { retrieve: async () => session } } }) },
    "./subscriptions": { deliverSubscription: async () => "waiting" },
  });
  const event = { id: "evt_1", type: "checkout.session.completed", created: 1700000000, data: { object: session } };
  await api.processPaymentEvent(event); const paidAt = order.paidAt;
  await api.processPaymentEvent(event);
  await api.processPaymentEvent({ ...event, id: "evt_2", type: "checkout.session.async_payment_succeeded", created: 1700000010 });
  assert.equal(writes, 1); assert.equal(order.paymentStatus, "PAID"); assert.equal(order.status, "CONFIRMED");
  assert.equal(order.paymentReference, "pi_test_1"); assert.equal(order.paymentAmount, 5500); assert.equal(order.paidAt, paidAt);
  assert.equal(order.adminNotifications.create.event, "PAYMENT_RECEIVED");
});

test("cancel/expired events never mark an order paid", async () => {
  const session = { ...validSession(), status: "expired", payment_status: "unpaid", payment_intent: null };
  let writes = 0;
  const tx = { $queryRaw: async () => [], order: { findUnique: async () => ({ id: "order-1", total: 55, paymentCurrency: "EUR", paymentStatus: "UNPAID", checkout: expected }), update: async () => { writes++; } },
    paymentWebhookEvent: { findUnique: async () => null, create: async () => {} } };
  const api = load("src/lib/payments/webhook.ts", { "@/lib/prisma": { $transaction: async fn => fn(tx) },
    "@/lib/admin-notifications": { notificationSeed: async event => ({ event, phoneStatus: "DISABLED" }) },
    "./stripe": { getStripe: () => ({ checkout: { sessions: { retrieve: async () => session } } }) }, "./subscriptions": { deliverSubscription: async () => assert.fail("Must not send email") } });
  await api.processPaymentEvent({ id: "evt_expired", type: "checkout.session.expired", data: { object: session } });
  assert.equal(writes, 0);
});

test("official Stripe SDK verifies raw webhook signatures and rejects tampered payloads", () => {
  const stripe = new Stripe("sk_test_placeholder");
  const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed", data: { object: validSession() } });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_test" });
  assert.equal(stripe.webhooks.constructEvent(payload, header, "whsec_test").id, "evt_test");
  assert.throws(() => stripe.webhooks.constructEvent(payload.replace("5500", "1"), header, "whsec_test"));
  assert.throws(() => stripe.webhooks.constructEvent(payload, header, "whsec_wrong"));
});

test("email failure remains unsent, retries reuse the key, and sent subscriptions cannot send twice", async () => {
  const order = { id: "order-1", paymentStatus: "PAID", status: "CONFIRMED", subscriptionInformation: "access details", customerName: "Client", customerEmail: "client@example.com", subscriptionSendingAt: null };
  const keys = []; let shouldFail = true;
  const prisma = { order: { findUnique: async () => ({ ...order }), updateMany: async ({ where, data }) => {
    if (where.subscriptionSentAt === null && order.subscriptionSentAt) return { count: 0 };
    Object.assign(order, data); return { count: 1 };
  } } };
  const api = load("src/lib/payments/subscriptions.ts", { "@/lib/prisma": prisma, "@/lib/email": { sendSubscriptionEmail: async input => {
    keys.push(input.idempotencyKey); if (shouldFail) throw new Error("Email down"); return "email-1";
  } } });
  await assert.rejects(api.deliverSubscription(order.id)); assert.equal(order.subscriptionSentAt, undefined);
  shouldFail = false; assert.equal(await api.deliverSubscription(order.id), "sent");
  assert.equal(keys[0], keys[1]); assert.ok(order.subscriptionSentAt); assert.equal(order.subscriptionEmailId, "email-1");
  await api.deliverSubscription(order.id); assert.equal(keys.length, 2);
});

test("assisted order creation uses database prices and rejects missing products", async () => {
  let created; let exists = true;
  const schema = load("src/lib/validation.ts");
  const store = { getProductById: async () => exists ? { name: "Real product", image: "/real.jpg", currentPrice: 55 } : null,
    createOrder: async data => { created = data; return { ...data, id: "order-1" }; }, computeDeliveryFee: async () => 0 };
  const route = load("src/app/api/orders/route.ts", { "@/lib/auth": { getCurrentUser: async () => null }, "@/lib/store": store,
    "next/server": { ...packageRequire("next/server"), after: () => {} },
    "@/lib/admin-notifications": { dispatchOrderAlerts: async () => {} },
    "@/lib/email": { sendOrderConfirmation: async () => {}, sendAdminOrderNotification: async () => {} },
    "@/lib/rateLimit": { rateLimit: () => null }, "@/lib/validation": schema,
    "@/lib/prisma": { product: { updateMany: async () => ({ count: 1 }) } },
    "@/lib/payments/access": { grantOrderPaymentAccess: async () => {} }, "@/lib/payments/stripe": { paymentConfigured: () => false },
  });
  const body = { items: [{ productId: 1, price: .01, quantity: 2, name: "Tampered", image: "/fake.jpg" }], address: { street: "Street", city: "Paris", postalCode: "75001", country: "France" },
    customer: { firstName: "Test", lastName: "Client", phone: "0612345678", email: "client@example.com" }, paymentMethod: "assisted" };
  const request = () => new Request("http://localhost:3000/api/orders", { method: "POST", body: JSON.stringify(body) });
  assert.equal((await route.POST(request())).status, 201); assert.equal(created.total, 110); assert.equal(created.items[0].productName, "Real product");
  assert.equal(created.paymentMethod, "assisted"); assert.equal(created.status, "pending");
  exists = false; assert.equal((await route.POST(request())).status, 400);
});

test("payment checkout rejects unauthorized order access and frontend amount overrides", async () => {
  const { NextRequest } = packageRequire("next/server");
  let sessions = 0;
  const route = load("src/app/api/payments/checkout/route.ts", { "@/lib/prisma": { order: { findUnique: async () => ({ id: "order-1", userId: "owner" }) } },
    "@/lib/payments/access": { canAccessPayment: async () => false }, "@/lib/payments/stripe": { paymentConfigured: () => true },
    "@/lib/payments/checkout": { createOrderCheckout: async () => { sessions++; } }, "@/lib/rateLimit": { rateLimit: () => null } });
  const request = body => new NextRequest("http://localhost:3000/api/payments/checkout", { method: "POST", body: JSON.stringify(body) });
  assert.equal((await route.POST(request({ orderId: "order-1" }))).status, 403);
  assert.equal((await route.POST(request({ orderId: "order-1", amount: 1 }))).status, 400);
  assert.equal(sessions, 0);
});

test("guest payment cookies are scoped to one order, signed, and expire; authenticated owners retain access", async () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-secret-for-payment-access-123456789";
  try {
    const values = new Map(); let user = null;
    const api = load("src/lib/payments/access.ts", {
      "next/headers": { cookies: async () => ({ get: name => values.has(name) ? { value: values.get(name) } : undefined, set: (name, value) => values.set(name, value) }) },
      "@/lib/auth": { getCurrentUser: async () => user },
    });
    await api.grantOrderPaymentAccess("order-1");
    assert.equal(await api.canAccessPayment({ id: "order-1", userId: "guest" }), true);
    values.set("payment_order_order-2", values.get("payment_order_order-1"));
    assert.equal(await api.canAccessPayment({ id: "order-2", userId: "guest" }), false);
    values.set("payment_order_order-1", "tampered");
    assert.equal(await api.canAccessPayment({ id: "order-1", userId: "guest" }), false);
    const { SignJWT } = packageRequire("jose");
    values.set("payment_order_order-1", await new SignJWT({ orderId: "order-1", purpose: "order-payment" })
      .setProtectedHeader({ alg: "HS256" }).setAudience("order-payment").setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET)));
    assert.equal(await api.canAccessPayment({ id: "order-1", userId: "guest" }), false);
    user = { userId: "owner" };
    assert.equal(await api.canAccessPayment({ id: "order-1", userId: "owner" }), true);
  } finally { if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous; }
});

test("subscription email escapes credentials in HTML, uses the order email and provider idempotency, and fails closed without a key", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_test_only";
  try {
    let request;
    class MailProvider {
      emails = { send: async (message, options) => { request = { message, options }; return { data: { id: "email-1" } }; } };
    }
    const api = load("src/lib/email.ts", { resend: { Resend: MailProvider }, "./store": { getSiteSettings: async () => ({}) } });
    const result = await api.sendSubscriptionEmail({ customerName: "<Client>", customerEmail: "client@example.com", orderNumber: "order-1", information: "<script>alert(1)</script>\nPassword: a&b", idempotencyKey: "subscription:key-1" });
    assert.equal(result, "email-1"); assert.equal(request.message.to, "client@example.com");
    assert.ok(request.message.html.includes("&lt;script&gt;")); assert.ok(!request.message.html.includes("<script>"));
    assert.equal(request.options.idempotencyKey, "subscription:key-1");
    delete process.env.RESEND_API_KEY;
    await assert.rejects(api.sendSubscriptionEmail({ customerName: "Client", customerEmail: "client@example.com", orderNumber: "order-1", information: "details", idempotencyKey: "key-1" }));
  } finally { if (previous === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous; }
});
