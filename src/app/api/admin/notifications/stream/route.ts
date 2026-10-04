import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Read the shared database so changes arrive across server instances, too.
// Only invalidation signals travel over this connection; order data uses the
// existing authenticated endpoints. EventSource reconnects after 50 seconds.
export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const encoder = new TextEncoder();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let finishDelay: (() => void) | undefined;
  const stop = () => { stopped = true; clearTimeout(timer); finishDelay?.(); };
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      req.signal.addEventListener("abort", stop, { once: true });
      const deadline = Date.now() + 50000;
      let previous = "";
      try {
        while (!stopped && !req.signal.aborted && Date.now() < deadline) {
          if (!await isAdmin(req)) break;
          const [latest, unread, updated] = await Promise.all([
            prisma.adminOrderNotification.findFirst({ orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true } }),
            prisma.adminOrderNotification.count({ where: { readAt: null } }),
            prisma.order.findFirst({ orderBy: { updatedAt: "desc" }, select: { id: true, updatedAt: true } }),
          ]);
          if (stopped || req.signal.aborted) break;
          const version = JSON.stringify([latest?.id, unread, updated?.id, updated?.updatedAt]);
          if (version !== previous) {
            controller.enqueue(encoder.encode(`event: orders\ndata: ${version}\n\n`));
            previous = version;
          } else controller.enqueue(encoder.encode(": heartbeat\n\n"));
          await new Promise<void>(resolve => { finishDelay = resolve; timer = setTimeout(resolve, 3000); });
        }
      } catch {
        // Close cleanly on DB/network errors; the browser retries and polling
        // continues independently as a fallback.
      } finally {
        req.signal.removeEventListener("abort", stop);
        clearTimeout(timer);
        if (!stopped) controller.close();
      }
    },
    cancel() { stop(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/event-stream", "Cache-Control": "private, no-store, no-transform",
    "X-Accel-Buffering": "no",
  } });
}
