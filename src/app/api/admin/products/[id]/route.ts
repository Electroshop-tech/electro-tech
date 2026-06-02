import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

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
  const product = await updateProduct(Number(id), body);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  addAdminLog("product.update", `Produit "${product.name}" (#${id}) mis à jour`).catch(() => {});
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
