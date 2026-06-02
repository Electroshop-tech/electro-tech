import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, addAdminLog, getPendingStockNotifications, markStockNotificationsSent } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";
import { sendBackInStockEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const before = await getProductById(Number(id));
  const product = await updateProduct(Number(id), body);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  addAdminLog("product.update", `Produit "${product.name}" (#${id}) mis à jour`).catch(() => {});

  // Back-in-stock: notify subscribers when product goes out-of-stock → in-stock
  if (before && before.inStock === false && product.inStock !== false) {
    (async () => {
      try {
        const pending = await getPendingStockNotifications(product.id);
        if (pending.length > 0) {
          await sendBackInStockEmail(pending.map((p) => p.email), product.name, product.slug);
          await markStockNotificationsSent(product.id);
          addAdminLog("stock.notify", `${pending.length} client(s) prévenu(s) du retour en stock de "${product.name}"`).catch(() => {});
        }
      } catch (err) {
        console.error("[restock-notify]", err);
      }
    })();
  }

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteProduct(Number(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  addAdminLog("product.delete", `Produit #${id} supprimé`).catch(() => {});
  return NextResponse.json({ ok: true });
}
