import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    const ext = (file.name.includes(".") ? "." + file.name.split(".").pop()! : ".jpg").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Type de fichier non autorisé: ${ext}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Fichier trop volumineux (max 10 Mo)` }, { status: 400 });
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `products/${Date.now()}-${safeName}`;
    try {
      const blob = await put(filename, file, { access: "public" });
      urls.push(blob.url);
    } catch (err) {
      console.error("Blob upload error:", err);
      return NextResponse.json({ error: "Erreur de stockage. Vérifiez la configuration du blob." }, { status: 500 });
    }
  }

  return NextResponse.json({ urls });
}
