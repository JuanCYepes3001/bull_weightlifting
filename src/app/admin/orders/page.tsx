import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Órdenes | Admin" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Ventas
        </p>
        <h1 className="text-2xl text-white">ÓRDENES</h1>
      </div>

      <div className="border border-white/5 rounded-sm p-16 flex flex-col items-center gap-4 text-center">
        <ShoppingCart size={36} className="text-white/10" />
        <div className="space-y-1">
          <p className="font-horizon text-sm tracking-widest text-white/30 uppercase">
            Disponible en Semana 2
          </p>
          <p className="font-body text-xs text-white/20 max-w-xs">
            La gestión de órdenes se implementará junto con la integración de
            Mercado Pago.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="mt-2 font-body text-xs tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors"
        >
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
