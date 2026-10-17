import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { getWompiTransaction } from "@/lib/wompi";
import { applyWompiTransaction } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

interface Props {
  searchParams: Promise<{ id?: string; env?: string }>;
}

// Wompi redirects here with ?id=<transaction id> after the customer pays.
// The result is read from Wompi's API (never trusted from the URL) and applied
// to the order — the webhook does the same, whichever arrives first wins.
export default async function WompiReturnPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) return <ErrorView message="No se recibió una transacción válida de Wompi." />;

  const tx = await getWompiTransaction(id);
  if (!tx) return <ErrorView message="No pudimos consultar el estado de tu pago. Revisa tus pedidos en unos minutos." />;

  try {
    await applyWompiTransaction(tx);
  } catch (err) {
    console.error("[Wompi return] Failed to apply transaction:", err);
  }

  // RLS: only returns the order if it belongs to the logged-in customer
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_id", tx.reference)
    .maybeSingle();

  if (tx.status === "APPROVED" && order) {
    redirect(`/checkout/success?order=${order.id}&method=wompi`);
  }
  if (tx.status === "PENDING" && order) {
    redirect(`/checkout/success?order=${order.id}&method=wompi_pending`);
  }

  const reason =
    tx.status === "DECLINED"
      ? "Tu banco o entidad rechazó el pago. No se realizó ningún cobro."
      : tx.status === "VOIDED"
      ? "La transacción fue anulada."
      : "Ocurrió un error procesando el pago. No se realizó ningún cobro.";

  return <ErrorView message={`${reason} Tus productos siguen en el carrito, puedes intentarlo de nuevo.`} />;
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <XCircle size={32} className="text-red-400" />
      </div>
      <div className="space-y-2">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-2xl text-white">Pago no completado</h1>
        <p className="font-body text-sm text-white/40 mt-2">{message}</p>
      </div>
      <Link href="/checkout">
        <Button size="md">Volver al checkout</Button>
      </Link>
    </div>
  );
}
