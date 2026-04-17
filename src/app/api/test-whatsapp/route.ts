import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp, buildOrderConfirmationMessage } from "@/lib/whatsapp";

// TEMPORARY — delete after testing
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  if (!to) return NextResponse.json({ error: "Falta ?to=numero" }, { status: 400 });

  const message = buildOrderConfirmationMessage({
    orderId: "test-1234-abcd-efgh",
    items: [{ productName: "Cinturón Bull", quantity: 1, price: 150000, size: "M", color: "Negro" }],
    total: 150000,
    paymentMethod: "nequi",
    shipping: { full_name: "Juan Pérez", city: "Bogotá", state: "Cundinamarca", address: "Calle 123 #45-67" },
  });

  await sendWhatsApp(to, message);
  return NextResponse.json({ ok: true, to, message });
}
