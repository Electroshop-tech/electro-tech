import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers, removeNewsletterSubscriber } from "@/lib/store";
import { sendNewsletterBulk } from "@/lib/email";
import { isAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { addAdminLog } from "@/lib/store";

// GET — list all subscribers
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json({ subscribers });
}

// POST — send bulk newsletter email to all subscribers
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { subject, body, imageBase64, imageMimeType } = await req.json();

    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json(
        { error: "Sujet et contenu requis." },
        { status: 400 }
      );
    }

    const subs = await prisma.newsletterSubscriber.findMany({
      select: { email: true, unsubscribeToken: true },
    });
    if (subs.length === 0) {
      return NextResponse.json(
        { error: "Aucun abonné à la newsletter." },
        { status: 400 }
      );
    }

    const result = await sendNewsletterBulk(
      subs,
      subject.trim(),
      body.trim(),
      imageBase64 && imageMimeType ? { imageBase64, imageMimeType } : undefined
    );

    addAdminLog("newsletter.send", `Newsletter envoyée à ${result.sent}/${subs.length} abonnés`).catch(() => {});

    return NextResponse.json({
      ok: true,
      totalSubscribers: subs.length,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.slice(0, 5), // only first 5 errors
    });
  } catch (err) {
    console.error("[newsletter-send]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE — remove a subscriber
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const removed = await removeNewsletterSubscriber(email.trim());
    if (!removed) {
      return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter-delete]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
