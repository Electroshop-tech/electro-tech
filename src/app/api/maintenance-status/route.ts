import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/store";

// Simple public endpoint the proxy can call to check maintenance status
export async function GET(_req: NextRequest) {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(
      { maintenance: settings.maintenanceMode === "true" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}
