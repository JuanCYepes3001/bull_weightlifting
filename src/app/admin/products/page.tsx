import { getAdminProducts } from "@/lib/queries/admin";
import { getLowStockProducts } from "@/lib/queries/admin";
import { AdminProductsTable } from "./AdminProductsTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos | Admin" };

export default async function AdminProductsPage() {
  const [products, lowStock] = await Promise.all([
    getAdminProducts().catch(() => []),
    getLowStockProducts(10).catch(() => []),
  ]);

  // Build a set of product IDs that have at least one low-stock variant
  const lowStockProductIds = new Set(lowStock.map((v) => v.productId));

  return (
    <div className="space-y-6">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Inventario
        </p>
        <h1 className="text-2xl text-white">PRODUCTOS</h1>
      </div>

      <AdminProductsTable products={products as any} lowStockIds={lowStockProductIds} />
    </div>
  );
}
