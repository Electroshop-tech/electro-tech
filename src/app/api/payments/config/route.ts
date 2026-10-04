import { NextResponse } from "next/server";
import { paymentConfigured } from "@/lib/payments/stripe";
export async function GET() {
  return NextResponse.json({ available: paymentConfigured() }, { headers: { "Cache-Control": "no-store" } });
}
