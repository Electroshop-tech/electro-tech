import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez ElectroShop-Tech : téléphone, e-mail et formulaire de contact. Notre équipe vous répond rapidement pour toute question sur nos box Android TV, caméras de surveillance et accessoires au Maroc.",
  alternates: { canonical: "https://electroshop-tech.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
