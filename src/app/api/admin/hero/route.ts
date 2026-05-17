import { NextRequest, NextResponse } from "next/server";
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/lib/store";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin1234";
function auth(req: NextRequest) { return req.headers.get("x-admin-key") === ADMIN_KEY; }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getHeroSlides());
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  return NextResponse.json(createHeroSlide(body), { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = updateHeroSlide(Number(body.id), body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = deleteHeroSlide(Number(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
