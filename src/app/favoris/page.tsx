import { getProducts } from "@/lib/store";
import FavorisClient from "./FavorisClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes Favoris — ElectroShop-Tech",
  description: "Vos produits sauvegardés en favoris sur ElectroShop-Tech.",
};

export default async function FavorisPage() {
  const products = await getProducts();
  return <FavorisClient products={products} />;
}
