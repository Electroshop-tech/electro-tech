import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { drainPhoneAlerts } from "@/lib/admin-notifications";
import { drainOrderEmails } from "@/lib/order-emails";

export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_NOTIFICATIONS_CRON_SECRET;
  const provided = req.headers.get("authorization");
  const expectedBytes = Buffer.from(`Bearer ${expected || ""}`);
  const providedBytes = Buffer.from(provided || "");
  if (!expected || providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const [processed, emailsProcessed] = await Promise.all([drainPhoneAlerts(), drainOrderEmails()]);
    return NextResponse.json({ processed, emailsProcessed });
  }
  catch { return NextResponse.json({ error: "File indisponible." }, { status: 500 }); }
}
