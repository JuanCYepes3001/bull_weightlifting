import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { finalizePayPalOrderAction } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";

interface Props {
  searchParams: Promise<{ token?: string; PayerID?: string }>;
}

export default async function PayPalReturnPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorView message="No se recibió un token de PayPal válido." />;
  }

  const result = await finalizePayPalOrderAction(token);

  if ("error" in result) {
    return <ErrorView message={result.error} />;
  }

  redirect(`/checkout/success?order=${result.orderId}&method=paypal`);
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
        <h1 className="text-2xl text-white">Error en el pago</h1>
        <p className="font-body text-sm text-white/40 mt-2">{message}</p>
      </div>
      <Link href="/checkout">
        <Button size="md">Volver al checkout</Button>
      </Link>
    </div>
  );
}
