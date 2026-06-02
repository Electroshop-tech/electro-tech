import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

const fallbackProductSlugs = [
  "android-tv-box-x96q",
  "x96q-pro-tv-box",
  "android-tv-stick-mortal-q8",
  "telecommande-universelle-smart-tv-box",
];

const fallbackCategorySlugs = [
  "passerelle-multimedia",
  "accessoires",
  "camera-surveillance",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://electroshop-tech.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produits`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/promotions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/livraison`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/garanties`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/retours`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/nouveautes`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/magasin`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let productSlugs = fallbackProductSlugs;
  let categorySlugs = fallbackCategorySlugs;

  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    productSlugs = products.map((p) => p.slug);
    categorySlugs = categories.map((c) => c.slug);
  } catch {
    // Keep sitemap generation available when the database is unreachable at build time.
  }

  const products = productSlugs.map((slug) => ({
    url: `${base}/produits/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const categories = categorySlugs.map((slug) => ({
    url: `${base}/categorie/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...products, ...categories];
}
