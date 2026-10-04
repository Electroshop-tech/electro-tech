import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
const packageRequire = createRequire(import.meta.url);
function load(relative, mocks = {}) {
  const filename = path.resolve(relative), module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const resolve = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`, mocks);
    if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), `${name}.ts`), mocks);
    return packageRequire(name);
  };
  new Function("require", "module", "exports", code)(resolve, module, module.exports);
  return module.exports;
}
const order = { id: "order-1", orderNumber: "MA123456789", userId: "guest", customerName: "Test <Client>", customerEmail: "client@example.com", customerPhone: "+33612345678", status: "pending", paymentMethod: "assisted", subtotal: 65, total: 65, address: { street: "1 <Street>", city: "Paris", postalCode: "75001", country: "France" }, items: [{ productId: 1, productName: "Test <Product>", productImage: "/test.png", quantity: 1, price: 65 }] };
function emailWorker(row, send) {
  const db = { orderEmailDelivery: {
    findUnique: async () => ({ ...row }),
    updateMany: async ({ where, data }) => { if (where.status && row.status !== where.status) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    update: async ({ data }) => { const increment = data.attempts?.increment; Object.assign(row, data); if (increment) row.attempts = (row.previousAttempts ?? 0) + increment; return row; },
  } };
  return load("src/lib/order-emails.ts", { "@/lib/prisma": db, "@/lib/store": { getOrderById: async () => order }, "@/lib/email": {
    prepareOrderConfirmation: async () => ({ from: "shop@example.com", to: order.customerEmail, subject: "Order", html: "Saved content" }),
    prepareAdminOrderNotification: async () => null, sendPreparedOrderEmail: send,
  } });
}
const delivery = () => ({ id: "email-1", orderId: order.id, kind: "CUSTOMER_CONFIRMATION", status: "PENDING", payload: null, attempts: 0, nextAttemptAt: new Date(0), firstAttemptAt: null });
test("provider configuration failures explain the repair without exposing raw responses", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "test-only";
  try {
    for (const [error, expected] of [
      [{ name: "validation_error", message: "API key is invalid" }, /RESEND_API_KEY/],
      [{ name: "validation_error", message: "The domain is not verified" }, /Domaine expéditeur non vérifié/],
      [{ name: "validation_error", message: "You can only send testing emails to your own email" }, /emails de test/],
    ]) {
      const api = load("src/lib/email.ts", {
        resend: { Resend: class { emails = { send: async () => ({ data: null, error }) }; } },
        "./store": { getSiteSettings: async () => ({}) },
      });
      await assert.rejects(api.sendPreparedOrderEmail({ from: "shop@example.com", to: "client@example.com", subject: "Test", html: "Test" }, "test-key"), expected);
    }
  } finally { previous === undefined ? delete process.env.RESEND_API_KEY : process.env.RESEND_API_KEY = previous; }
});
async function configured(work) {
  const previous = process.env.RESEND_API_KEY; process.env.RESEND_API_KEY = "test-only";
  try { await work(); } finally { if (previous === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous; }
}

test("concurrent email workers send once, save the provider reference and never resend accepted emails", async () => configured(async () => {
  const row = delivery(); let sends = 0;
  const api = emailWorker(row, async (payload, key) => { sends++; assert.equal(payload.to, order.customerEmail); assert.equal(key, "order-email/email-1"); return "provider-1"; });
  await Promise.all([api.dispatchOrderEmail(row.id), api.dispatchOrderEmail(row.id)]);
  assert.equal(sends, 1); assert.equal(row.status, "ACCEPTED"); assert.equal(row.providerId, "provider-1"); assert.ok(row.acceptedAt);
  await api.dispatchOrderEmail(row.id); assert.equal(sends, 1);
}));
test("email timeout retries reuse the saved payload and idempotency key", async () => configured(async () => {
  const row = delivery(), calls = [];
  const api = emailWorker(row, async (payload, key) => { calls.push({ payload, key }); if (calls.length === 1) throw new Error("Timeout"); return "provider-1"; });
  await api.dispatchOrderEmail(row.id); assert.equal(row.status, "PENDING"); assert.equal(row.error, "Timeout");
  row.nextAttemptAt = new Date(0); await api.dispatchOrderEmail(row.id);
  assert.equal(row.status, "ACCEPTED"); assert.deepEqual(calls[0], calls[1]);
}));
test("missing email credentials record an actionable failure without contacting the provider", async () => {
  const previous = process.env.RESEND_API_KEY; delete process.env.RESEND_API_KEY;
  try { const row = delivery(); await emailWorker(row, async () => assert.fail("must not send")).dispatchOrderEmail(row.id); assert.equal(row.status, "FAILED"); assert.match(row.error, /RESEND_API_KEY/); assert.equal(row.firstAttemptAt, null); }
  finally { if (previous !== undefined) process.env.RESEND_API_KEY = previous; }
});
test("uncertain emails outside the provider deduplication window require review", async () => configured(async () => {
  const row = { ...delivery(), firstAttemptAt: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  await emailWorker(row, async () => assert.fail("must not send")).dispatchOrderEmail(row.id); assert.equal(row.status, "UNKNOWN");
}));
test("disabled admin emails do not block customer confirmations", async () => configured(async () => {
  const row = { ...delivery(), kind: "ADMIN_ORDER" }; await emailWorker(row, async () => assert.fail("must not send")).dispatchOrderEmail(row.id); assert.equal(row.status, "SKIPPED");
}));
test("guest checkout reserves grouped stock and persists order, notification and email jobs together", async () => {
  let saved, guest = false; const reservations = [];
  const api = load("src/lib/store.ts", { "./prisma": { $transaction: async work => work({
    user: { upsert: async () => { guest = true; } },
    product: { updateMany: async input => { if (input.data.stockQuantity) reservations.push(input); return { count: 1 }; } },
    order: { create: async ({ data }) => { assert.ok(guest); saved = data; return { ...data, id: order.id, items: [], createdAt: new Date(), updatedAt: new Date() }; } },
  }) }, "./product-images": { resolveProductImage: value => value }, "next/cache": { unstable_cache: fn => fn }, "@/lib/admin-notifications": { notificationSeed: async event => ({ event, phoneStatus: "DISABLED" }) } });
  await api.createOrder({ ...order, items: [order.items[0], { ...order.items[0], quantity: 2 }] });
  assert.equal(reservations.length, 1); assert.equal(reservations[0].data.stockQuantity.decrement, 3);
  assert.equal(saved.adminNotifications.create.event, "ORDER_CREATED"); assert.equal(saved.emailDeliveries.create.length, 2);
});
test("stock shortages stop saving orders and notifications", async () => {
  const api = load("src/lib/store.ts", { "./prisma": { $transaction: async work => work({ user: { upsert: async () => {} }, product: { updateMany: async () => ({ count: 0 }) }, order: { create: () => assert.fail("must not save") } }) }, "./product-images": {}, "next/cache": { unstable_cache: fn => fn }, "@/lib/admin-notifications": { notificationSeed: async event => ({ event }) } });
  await assert.rejects(api.createOrder(order), /ORDER_OUT_OF_STOCK/);
});
test("confirmation email supports guest tracking, reference numbers and escaped customer content", async () => {
  const api = load("src/lib/email.ts", { "./store": { getSiteSettings: async () => ({ siteEmail: "owner@example.com" }) } });
  const payload = await api.prepareOrderConfirmation(order); assert.equal(payload.to, order.customerEmail); assert.match(payload.html, /MA123456789/); assert.match(payload.html, /suivi-commande\?id=MA123456789/); assert.match(payload.html, /Test &lt;Client&gt;/); assert.match(payload.html, /Test &lt;Product&gt;/);
  assert.match(payload.subject, /Confirmation de votre commande MA123456789/);
  assert.match(payload.text, /Total : 65\.00 €/);
  assert.match(payload.text, /suivi-commande\?id=MA123456789/);
  assert.match(payload.text, /paiement avant expédition/);
  const admin = await api.prepareAdminOrderNotification(order); assert.equal(admin.to, "owner@example.com"); assert.match(admin.html, /admin\/orders\?order=order-1/);
});

test("checkout warnings accept international names and formatted French contact details", () => {
  const { validateCheckout } = load("src/lib/checkout-validation.ts");
  const fields = { firstName: "Élodie", lastName: "O’Connor-Martin", phone: "06 12 34 56 78", email: "client@example.fr", city: "Paris 16e", zip: "75016", address: "12 rue de Paris", notes: "" };
  assert.deepEqual(validateCheckout(fields), {});
  assert.deepEqual(validateCheckout({ ...fields, firstName: "محمد", lastName: "李", phone: "+33 6 12 34 56 78" }), {});
  assert.deepEqual(validateCheckout({ ...fields, firstName: "A", lastName: "Li" }), {});
});

test("checkout warnings identify missing fields and malformed names, emails, phones and postal codes", () => {
  const { validateCheckout } = load("src/lib/checkout-validation.ts");
  const fields = { firstName: "123", lastName: "@", phone: "1234", email: "client@", city: "75002", zip: "75abc", address: "   ", notes: "" };
  const errors = validateCheckout(fields);
  assert.deepEqual(Object.keys(errors).sort(), ["address", "city", "email", "firstName", "lastName", "phone", "zip"]);
  assert.match(errors.email, /vous@exemple.fr/);
  assert.match(errors.phone, /06 12 34 56 78/);
  assert.match(errors.zip, /5 chiffres/);
  assert.equal(validateCheckout({ ...fields, email: "client@example.fr" }).email, undefined);
  assert.ok(validateCheckout({ ...fields, email: "client..name@example.fr" }).email);
  assert.ok(validateCheckout({ ...fields, notes: "x".repeat(2001) }).notes);
});
