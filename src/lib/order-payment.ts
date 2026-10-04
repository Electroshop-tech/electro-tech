export function paymentMethodLabel(method: string) {
  if (method === "assisted") return "Paiement accompagné";
  if (method === "stripe") return "Carte bancaire";
  // Existing historical orders keep their original method.
  if (method === "cash_on_delivery") return "Paiement à la livraison";
  return method;
}
