import { NextRequest, NextResponse } from "next/server";
import { getDeliveryFeeForCity, getDeliveryZones, getDeliveryConfig, computeDeliveryFee } from "@/lib/store";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  const subtotalParam = req.nextUrl.searchParams.get("subtotal");

  // Effective fee for a given cart (used by cart/checkout to show the live amount).
  if (subtotalParam !== null) {
    const subtotal = Math.max(0, parseFloat(subtotalParam) || 0);
    const fee = await computeDeliveryFee(subtotal, city ?? undefined);
    const config = await getDeliveryConfig();
    return NextResponse.json({ fee, freeFrom: config.freeFrom });
  }

  if (city) {
    const fee = await getDeliveryFeeForCity(city);
    return NextResponse.json({ fee: fee ?? 0 });
  }

  // Return the global config + active zones (for displaying on checkout)
  const config = await getDeliveryConfig();
  const zones = await getDeliveryZones();
  return NextResponse.json({
    fee: config.fee,
    freeFrom: config.freeFrom,
    zones: zones.filter(z => z.active).map(z => ({
      name: z.name,
      cities: z.cities,
      fee: z.fee,
    })),
  });
}
