import { NextRequest, NextResponse } from "next/server";
import { getProductsAdmin, createProduct, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getProductsAdmin());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const product = await createProduct(body);
    addAdminLog("product.create", `Produit "${product.name}" créé`).catch(() => {});
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[POST /api/admin/products]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
