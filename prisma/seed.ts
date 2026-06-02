import { PrismaClient } from "../src/generated/prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import {
  heroSlides,
  categories,
  bestDeals,
  brands,
  reviews,
} from "../src/lib/data";

import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set. Check your .env file.");
}

neonConfig.webSocketConstructor = ws;

function parseDbUrl(raw: string) {
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: true,
  };
}

const adapter = new PrismaNeon(parseDbUrl(connectionString));
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  console.log("🌱 Seeding database...");

  // ── Hero Slides ──────────────────────────────────────────────────────────
  console.log("  → Hero slides...");
  for (const slide of heroSlides) {
    await prisma.heroSlide.upsert({
      where: { id: slide.id },
      update: slide,
      create: slide,
    });
  }

  // ── Categories ───────────────────────────────────────────────────────────
  console.log("  → Categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // ── Brands ───────────────────────────────────────────────────────────────
  console.log("  → Brands...");
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: brand,
      create: brand,
    });
  }

  // ── Reviews ──────────────────────────────────────────────────────────────
  console.log("  → Reviews...");
  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }

  // ── Products ─────────────────────────────────────────────────────────────
  console.log("  → Products...");
  for (const p of bestDeals) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        originalPrice: p.originalPrice,
        currentPrice: p.currentPrice,
        image: p.image,
        badge: p.badge ?? null,
        isRefurbished: p.isRefurbished ?? false,
        category: p.category,
        brand: p.brand,
        slug: p.slug,
        sku: p.sku ?? null,
        condition: p.condition ?? null,
        guarantee: p.guarantee ?? null,
        inStock: p.inStock ?? true,
        specs: p.specs ?? [],
        images: p.images ?? [],
        descriptionSections: (p.descriptionSections as unknown as undefined) ?? undefined,
        characteristics: (p.characteristics as unknown as undefined) ?? undefined,
        productReviews: (p.productReviews as unknown as undefined) ?? undefined,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        originalPrice: p.originalPrice,
        currentPrice: p.currentPrice,
        image: p.image,
        badge: p.badge ?? null,
        isRefurbished: p.isRefurbished ?? false,
        category: p.category,
        brand: p.brand,
        slug: p.slug,
        sku: p.sku ?? null,
        condition: p.condition ?? null,
        guarantee: p.guarantee ?? null,
        inStock: p.inStock ?? true,
        specs: p.specs ?? [],
        images: p.images ?? [],
        descriptionSections: (p.descriptionSections as unknown as undefined) ?? undefined,
        characteristics: (p.characteristics as unknown as undefined) ?? undefined,
        productReviews: (p.productReviews as unknown as undefined) ?? undefined,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   ${heroSlides.length} hero slides`);
  console.log(`   ${categories.length} categories`);
  console.log(`   ${brands.length} brands`);
  console.log(`   ${reviews.length} reviews`);
  console.log(`   ${bestDeals.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
