import PaymentResult from "@/components/PaymentResult";
export const metadata = { title: "Confirmation du paiement", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams;
  return <PaymentResult orderId={typeof params.orderId === "string" ? params.orderId : ""} />;
}
