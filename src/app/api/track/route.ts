import { NextRequest, NextResponse } from "next/server";
import { appendPageView } from "@/lib/store";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; referrer?: string; sessionId?: string };
    const url = String(body.url ?? "").slice(0, 500);
    const referrer = String(body.referrer ?? "").slice(0, 500);
    const sessionId = String(body.sessionId ?? "").slice(0, 64);
    const ua = req.headers.get("user-agent") ?? "";

    if (!url) return NextResponse.json({ ok: false }, { status: 400 });

    await appendPageView({ id: randomUUID(), url, referrer, ua, sessionId, timestamp: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
