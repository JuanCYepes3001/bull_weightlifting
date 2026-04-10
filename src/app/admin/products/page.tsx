import { getAdminProducts, getLowStockProducts } from "@/lib/queries/admin";
import { AdminProductsTable } from "./AdminProductsTable";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos | Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;

  const [products, lowStock] = await Promise.all([
    getAdminProducts().catch(() => []),
    getLowStockProducts(10).catch(() => []),
  ]);

  const lowStockProductIds = new Set(lowStock.map((v) => v.productId));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Inventario
        </p>
        <h1 className="text-2xl text-white">PRODUCTOS</h1>
      </div>

      {saved === "true" && (
        <div className="flex items-center gap-3 border border-green-500/25 bg-green-500/5 px-5 py-3">
          <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
          <p className="font-body text-xs tracking-widest uppercase text-green-400">
            Producto guardado satisfactoriamente
          </p>
        </div>
      )}

      <AdminProductsTable products={products as any} lowStockIds={lowStockProductIds} />
    </div>
  );
}
