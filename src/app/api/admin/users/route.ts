import { NextRequest, NextResponse } from "next/server";
import { getAdminUsers, getAdminUserByEmail, createAdminUser, updateAdminUser, deleteAdminUser, addAdminLog } from "@/lib/store";
import { getAdminPayload } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";

const ROLES = ["owner", "manager", "staff"];

export async function GET(req: NextRequest) {
  const me = await getAdminPayload(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.staffRole === "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getAdminUsers());
}

export async function POST(req: NextRequest) {
  const me = await getAdminPayload(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.staffRole !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, name, role, password } = await req.json();
  if (!email?.trim() || !name?.trim() || !password || String(password).length < 6) {
    return NextResponse.json({ error: "Champs invalides (mot de passe ≥ 6 caractères)." }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }
  const existing = await getAdminUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Un compte avec cet e-mail existe déjà." }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await createAdminUser({ email, name, role, passwordHash });
  await addAdminLog("staff.create", `Compte staff créé : ${email} (${role})`);
  return NextResponse.json(user, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const me = await getAdminPayload(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.staffRole !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, name, role, active, password } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (role !== undefined && !ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }
  const data: { name?: string; role?: string; active?: boolean; passwordHash?: string } = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (active !== undefined) data.active = active;
  if (password) {
    if (String(password).length < 6) return NextResponse.json({ error: "Mot de passe ≥ 6 caractères." }, { status: 400 });
    data.passwordHash = await hashPassword(password);
  }
  const updated = await updateAdminUser(id, data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAdminLog("staff.update", `Compte staff modifié : ${updated.email}`);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const me = await getAdminPayload(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.staffRole !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (id && me.uid === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }
  const ok = await deleteAdminUser(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await addAdminLog("staff.delete", `Compte staff supprimé (#${id})`);
  return NextResponse.json({ ok: true });
}
