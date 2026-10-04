import "server-only";
import Stripe from "stripe";

export function paymentConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.JWT_SECRET && process.env.NEXT_PUBLIC_SITE_URL);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Payment provider not configured");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}

export function paymentSiteUrl() {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("Payment site URL must use HTTPS");
  }
  return url.origin;
}
