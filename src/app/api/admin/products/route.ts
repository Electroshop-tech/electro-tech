import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/store";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin1234";

function auth(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const product = createProduct(body);
  return NextResponse.json(product, { status: 201 });
}
