import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);

  if (!code) {
    return NextResponse.json({ ok: false, error: "Code manquant" }, { status: 400 });
  }

  const result = await validatePromoCode(code, subtotal);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
