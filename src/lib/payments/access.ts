import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required for order payment access");
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function grantOrderPaymentAccess(orderId: string) {
  if (!process.env.JWT_SECRET) return;
  const token = await new SignJWT({ orderId, purpose: "order-payment" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("30d").setAudience("order-payment").sign(secret());
  (await cookies()).set(`payment_order_${orderId}`, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export async function canAccessPayment(order: { id: string; userId: string }) {
  const user = await getCurrentUser();
  if (user && user.userId === order.userId) return true;
  const token = (await cookies()).get(`payment_order_${order.id}`)?.value;
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"], audience: "order-payment" });
    return payload.orderId === order.id && payload.purpose === "order-payment";
  } catch { return false; }
}
