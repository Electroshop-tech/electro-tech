import { getProducts } from "@/lib/store";
import ComparerClient from "./ComparerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparer des produits — ElectroShop-Tech",
  description: "Comparez jusqu'à 3 produits côte à côte pour faire le meilleur choix.",
};

export default async function ComparerPage() {
  const products = await getProducts();
  return <ComparerClient products={products} />;
}
