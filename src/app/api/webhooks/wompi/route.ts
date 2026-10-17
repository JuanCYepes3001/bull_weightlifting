import { NextResponse, type NextRequest } from "next/server";
import { verifyWompiEvent, getWompiTransaction, type WompiEvent } from "@/lib/wompi";
import { applyWompiTransaction } from "@/lib/payments";

// Wompi "URL de eventos". Configure in comercios.wompi.co → Desarrolladores:
//   https://<tu-dominio>/api/webhooks/wompi
// Wompi retries (30 min, 3 h, 24 h) until it receives a 200.
export async function POST(request: NextRequest) {
  let evt: WompiEvent;
  try {
    evt = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!verifyWompiEvent(evt)) {
    console.warn("[Wompi webhook] Invalid signature — event ignored");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (evt.event !== "transaction.updated" || !evt.data.transaction?.id) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Re-read the transaction from Wompi so the stored result never depends
    // on fields outside the signed properties.
    const tx = await getWompiTransaction(evt.data.transaction.id);
    if (!tx) throw new Error(`transaction ${evt.data.transaction.id} not found in Wompi`);
    const outcome = await applyWompiTransaction(tx);
    return NextResponse.json({ ok: true, outcome });
  } catch (err) {
    console.error("[Wompi webhook] Failed to apply transaction:", err);
    // Non-200 → Wompi retries later
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
