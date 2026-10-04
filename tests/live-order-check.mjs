// Manual integration check. Retains one clearly labelled, cancelled test order.
// Only runs while real outbound providers are absent; unit tests cover sending.
import fs from "node:fs";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { SignJWT } from "jose";
dotenv.config({ quiet: true });
if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local", override: true, quiet: true });
if (process.env.RESEND_API_KEY || process.env.TWILIO_AUTH_TOKEN) throw new Error("Use an isolated test environment before running this check with outbound providers configured.");
const base = process.env.ORDER_TEST_BASE_URL || "http://localhost:3100";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("This integration check must target the local server.");
const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
const [product] = await sql`SELECT id, "currentPrice" FROM "Product" WHERE "inStock"=true AND "stockQuantity">0 ORDER BY id LIMIT 1`;
if (!product) throw new Error("No stocked product available for the order check.");
const marker = `TEST ORDER - DO NOT FULFILL - ${crypto.randomUUID()}`;
const response = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json", origin: base }, body: JSON.stringify({
  items: [{ productId: product.id, quantity: 1, price: 0.01 }], paymentMethod: "assisted", notes: marker,
  address: { street: "TEST ONLY", city: "Paris", postalCode: "75001", country: "France" },
  customer: { firstName: "TEST", lastName: "DO NOT FULFILL", email: "order-test@example.invalid", phone: "0600000000" },
}) });
const result = await response.json();
if (response.status !== 201) throw new Error(`Order API returned ${response.status}: ${result.error}`);
const id = result.order.id;
try {
  const token = await new SignJWT({ role: "admin", staffRole: "owner", name: "Local integration check" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("2m").sign(new TextEncoder().encode(process.env.JWT_SECRET ?? "set-jwt-secret-in-env"));
  const headers = { cookie: `admin_token=${token}` };
  const ordersResponse = await fetch(`${base}/api/admin/orders?q=${encodeURIComponent(id)}`, { headers });
  const orders = await ordersResponse.json();
  const noticesResponse = await fetch(`${base}/api/admin/notifications`, { headers });
  const notices = await noticesResponse.json();
  const saved = orders.orders?.find(order => order.id === id);
  const notice = notices.notifications?.find(notice => notice.order.id === id);
  if (!saved || !notice) throw new Error("Order or notification is absent from the authenticated admin API.");
  if (saved.items[0].price !== product.currentPrice) throw new Error("Client price was not replaced with the database price.");
  const emailRows = await sql`SELECT kind, status FROM "OrderEmailDelivery" WHERE "orderId"=${id}`;
  const tracked = await fetch(`${base}/api/orders/track?id=${encodeURIComponent(result.order.orderNumber)}`).then(r => r.json());
  if (tracked.id !== id) throw new Error("Guest order tracking could not find the saved reference.");
  console.log(JSON.stringify({ orderId: id, reference: result.order.orderNumber, status: response.status, adminOrderSaved: true, adminNotificationSaved: true, customerContactSaved: Boolean(saved.customerPhone && saved.customerEmail), authoritativePrice: true, guestTrackingWorks: true, emailJobs: emailRows }, null, 2));
} finally {
  // Keep the test order for review, cancel it, release its stock and suppress test alerts.
  await sql.transaction([
    sql`UPDATE "Product" SET "stockQuantity"="stockQuantity"+1, "inStock"=true, "updatedAt"=NOW() WHERE id=${product.id}`,
    sql`UPDATE "Order" SET status='CANCELLED', "updatedAt"=NOW() WHERE id=${id}`,
    sql`UPDATE "AdminOrderNotification" SET "readAt"=NOW(), "phoneStatus"='DISABLED', "phoneError"=NULL WHERE "orderId"=${id}`,
    sql`UPDATE "OrderEmailDelivery" SET status='SKIPPED', error='Integration test - no real email sent', payload=NULL WHERE "orderId"=${id}`,
  ]);
}
