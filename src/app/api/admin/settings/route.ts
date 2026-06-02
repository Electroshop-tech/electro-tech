import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await saveSiteSettings(body);
  addAdminLog("settings.update", `Paramètres mis à jour: ${Object.keys(body).join(", ")}`).catch(() => {});
  return NextResponse.json({ ok: true });
}
