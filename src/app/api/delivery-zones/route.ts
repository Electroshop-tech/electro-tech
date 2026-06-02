import { NextRequest, NextResponse } from "next/server";
import { getDeliveryFeeForCity, getDeliveryZones } from "@/lib/store";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");

  if (city) {
    const fee = await getDeliveryFeeForCity(city);
    return NextResponse.json({ fee: fee ?? 0 });
  }

  // Return all active zones (for displaying on checkout)
  const zones = await getDeliveryZones();
  return NextResponse.json({
    zones: zones.filter(z => z.active).map(z => ({
      name: z.name,
      cities: z.cities,
      fee: z.fee,
    })),
  });
}
