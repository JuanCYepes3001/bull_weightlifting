import { NextResponse, type NextRequest } from "next/server";
import { expireStaleWompiOrders } from "@/lib/payments";

// Daily safety net (vercel.json) for abandoned Wompi checkouts. The same job
// also runs opportunistically every time a customer starts a Wompi checkout.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await expireStaleWompiOrders();
  return NextResponse.json(result);
}
