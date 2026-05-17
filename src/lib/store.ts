import fs from "fs";
import path from "path";
import type { Product, Category, Brand, HeroSlide, Review } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export interface DB {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  heroSlides: HeroSlide[];
  reviews: Review[];
  nextProductId: number;
}

function getDefaultDB(): DB {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const staticData = require("./data");
  const all: Product[] = staticData.bestDeals ?? [];
  const products = [...new Map(all.map((p: Product) => [p.id, p])).values()] as Product[];
  return {
    products,
    categories: staticData.categories ?? [],
    brands: staticData.brands ?? [],
    heroSlides: staticData.heroSlides ?? [],
    reviews: staticData.reviews ?? [],
    nextProductId: products.length > 0 ? Math.max(...products.map((p: Product) => p.id)) + 1 : 1,
  };
}

export function readDB(): DB {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<DB>;
      const defaults = getDefaultDB();
      return {
        products: parsed.products ?? defaults.products,
        categories: parsed.categories ?? defaults.categories,
        brands: parsed.brands ?? defaults.brands,
        heroSlides: parsed.heroSlides ?? defaults.heroSlides,
        reviews: parsed.reviews ?? defaults.reviews,
        nextProductId: parsed.nextProductId ?? defaults.nextProductId,
      };
    }
  } catch (err) {
    console.error("[store] Error reading db.json:", err);
  }
  return getDefaultDB();
}

export function writeDB(db: DB): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// ── Products ──────────────────────────────────────────────────────────────────
export function getProducts(): Product[] {
  return readDB().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return readDB().products.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return readDB().products.find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id">): Product {
  const db = readDB();
  const product: Product = { ...(data as object), id: db.nextProductId } as Product;
  db.products.push(product);
  db.nextProductId += 1;
  writeDB(db);
  return product;
}

export function updateProduct(id: number, data: Partial<Product>): Product | null {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...data };
  writeDB(db);
  return db.products[idx];
}

export function deleteProduct(id: number): boolean {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.products.splice(idx, 1);
  writeDB(db);
  return true;
}

// ── Categories ────────────────────────────────────────────────────────────────
export function getCategories(): Category[] {
  return readDB().categories;
}

export function createCategory(data: Omit<Category, "id">): Category {
  const db = readDB();
  const cat: Category = { ...data, id: Date.now() };
  db.categories.push(cat);
  writeDB(db);
  return cat;
}

export function updateCategory(id: number, data: Partial<Category>): Category | null {
  const db = readDB();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.categories[idx] = { ...db.categories[idx], ...data };
  writeDB(db);
  return db.categories[idx];
}

export function deleteCategory(id: number): boolean {
  const db = readDB();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.categories.splice(idx, 1);
  writeDB(db);
  return true;
}

// ── Brands ────────────────────────────────────────────────────────────────────
export function getBrands(): Brand[] {
  return readDB().brands;
}

export function createBrand(data: Omit<Brand, "id">): Brand {
  const db = readDB();
  const brand: Brand = { ...data, id: Date.now() };
  db.brands.push(brand);
  writeDB(db);
  return brand;
}

export function updateBrand(id: number, data: Partial<Brand>): Brand | null {
  const db = readDB();
  const idx = db.brands.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.brands[idx] = { ...db.brands[idx], ...data };
  writeDB(db);
  return db.brands[idx];
}

export function deleteBrand(id: number): boolean {
  const db = readDB();
  const idx = db.brands.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  db.brands.splice(idx, 1);
  writeDB(db);
  return true;
}

// ── Hero Slides ───────────────────────────────────────────────────────────────
export function getHeroSlides(): HeroSlide[] {
  return readDB().heroSlides;
}

export function createHeroSlide(data: Omit<HeroSlide, "id">): HeroSlide {
  const db = readDB();
  const slide: HeroSlide = { ...data, id: Date.now() };
  db.heroSlides.push(slide);
  writeDB(db);
  return slide;
}

export function updateHeroSlide(id: number, data: Partial<HeroSlide>): HeroSlide | null {
  const db = readDB();
  const idx = db.heroSlides.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  db.heroSlides[idx] = { ...db.heroSlides[idx], ...data };
  writeDB(db);
  return db.heroSlides[idx];
}

export function deleteHeroSlide(id: number): boolean {
  const db = readDB();
  const idx = db.heroSlides.findIndex((h) => h.id === id);
  if (idx === -1) return false;
  db.heroSlides.splice(idx, 1);
  writeDB(db);
  return true;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export function getReviews(): Review[] {
  return readDB().reviews;
}
