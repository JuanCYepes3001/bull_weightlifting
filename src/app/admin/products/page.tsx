import Link from "next/link";
import { getAdminProducts } from "@/lib/queries/admin";
import { AdminProductRow } from "./AdminProductRow";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos | Admin" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts().catch(() => []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
            Inventario
          </p>
          <h1 className="text-2xl text-white">PRODUCTOS</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-crimson hover:bg-crimson-light text-white font-body text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
        >
          <Plus size={13} />
          Nuevo producto
        </Link>
      </div>

      {/* Table */}
      <div className="border border-white/5 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {["Producto", "Categoría", "Precio", "Variantes", "Estado", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-body text-[10px] tracking-[0.25em] uppercase text-white/30"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center font-body text-sm text-white/20"
                >
                  No hay productos. Crea el primero.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <AdminProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
