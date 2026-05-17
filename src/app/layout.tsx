import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ElectroShop-Tech.ma – Passerelle Multimédia, Accessoires & Caméras au Maroc",
  description:
    "ElectroShop-Tech.ma, votre spécialiste en ligne pour les box multimédias Android TV, systèmes de vidéosurveillance IP et accessoires high-tech au Maroc. Produits 100% authentiques, garantis et livrés rapidement.",
  keywords: "informatique maroc, pc portable maroc, pc gamer maroc, ordinateur occasion maroc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-slate-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
