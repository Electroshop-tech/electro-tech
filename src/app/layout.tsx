import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import Providers from "@/components/Providers";
import ScrollAnimations from "@/components/ScrollAnimations";
import PageTracker from "@/components/PageTracker";

export const metadata: Metadata = {
  title: {
    default: "ElectroShop-Tech – Passerelle Multimédia, Accessoires & Caméras au Maroc",
    template: "%s | ElectroShop-Tech",
  },
  description:
    "ElectroShop-Tech, votre spécialiste en ligne pour les box multimédias Android TV, systèmes de vidéosurveillance IP et accessoires high-tech au Maroc. Produits 100% authentiques, garantis et livrés rapidement.",
  keywords: "android tv box maroc, box multimedia maroc, camera surveillance maroc, accessoires tv maroc, electroshop tech, electroshop-tech",
  metadataBase: new URL("https://electroshop-tech.com"),
  other: { "theme-color": "#f97316" },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: "https://electroshop-tech.com",
    siteName: "ElectroShop-Tech",
    title: "ElectroShop-Tech – Passerelle Multimédia, Accessoires & Caméras au Maroc",
    description: "Votre spécialiste box Android TV, caméras de surveillance et accessoires high-tech au Maroc. Livraison rapide, paiement à la livraison.",
    images: [
      {
        url: "/images/3D%20hero%20section/3D%20Hero%20section%201.jpg",
        width: 1200,
        height: 630,
        alt: "ElectroShop-Tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ElectroShop-Tech – Passerelle Multimédia au Maroc",
    description: "Box Android TV, caméras de surveillance et accessoires high-tech. Livraison au Maroc.",
    images: ["/images/3D%20hero%20section/3D%20Hero%20section%201.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "any" },
    ],
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ElectroShop-Tech",
              url: "https://electroshop-tech.com",
              logo: "https://electroshop-tech.com/images/icon-512.png",
              description: "Spécialiste en box multimédias Android TV, caméras de surveillance et accessoires high-tech au Maroc.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Casablanca",
                addressCountry: "MA",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+212-716-408919",
                contactType: "customer service",
                availableLanguage: ["French", "Arabic"],
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "ElectroShop-Tech",
              image: "https://electroshop-tech.com/images/icon-512.png",
              url: "https://electroshop-tech.com",
              telephone: "+212-716-408919",
              priceRange: "MAD",
              currenciesAccepted: "MAD",
              paymentAccepted: "Cash on Delivery",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Casablanca",
                addressCountry: "MA",
              },
              areaServed: {
                "@type": "Country",
                name: "Maroc",
              },
            }),
          }}
        />
        <Providers>
          <Suspense fallback={null}><PageTracker /></Suspense>
          <ScrollAnimations />
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
