import { NextRequest, NextResponse } from "next/server";
import { getDeliveryZones, createDeliveryZone, updateDeliveryZone, deleteDeliveryZone, addAdminLog } from "@/lib/store";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const zones = await getDeliveryZones();
  return NextResponse.json({ zones });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  if (!data.name || !data.cities?.length) {
    return NextResponse.json({ error: "Nom et villes requis." }, { status: 400 });
  }
  const zone = await createDeliveryZone({
    name: data.name,
    cities: data.cities,
    fee: Number(data.fee) || 0,
    active: data.active ?? true,
  });
  addAdminLog("delivery.create", `Zone "${zone.name}" créée (${zone.fee}€)`).catch(() => {});
  return NextResponse.json({ zone }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
  const updated = await updateDeliveryZone(data.id, data);
  if (!updated) return NextResponse.json({ error: "Zone introuvable." }, { status: 404 });
  addAdminLog("delivery.update", `Zone "${updated.name}" mise à jour`).catch(() => {});
  return NextResponse.json({ zone: updated });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = await deleteDeliveryZone(id);
  if (!ok) return NextResponse.json({ error: "Zone introuvable." }, { status: 404 });
  addAdminLog("delivery.delete", `Zone #${id} supprimée`).catch(() => {});
  return NextResponse.json({ ok: true });
}
