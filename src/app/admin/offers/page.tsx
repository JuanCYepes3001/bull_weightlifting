import Link from "next/link";
import { getAdminOffers, getAdminProducts } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/categories";
import { AdminProductRow } from "../products/AdminProductRow";
import { BulkOfferManager } from "./BulkOfferManager";
import { Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ofertas | Admin" };

export default async function AdminOffersPage() {
  const [offers, allProducts, categories] = await Promise.all([
    getAdminOffers().catch(() => []),
    getAdminProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
            Promociones
          </p>
          <h1 className="text-2xl text-white">OFERTAS ACTIVAS</h1>
        </div>
        <div className="flex items-center gap-4">
          <BulkOfferManager products={allProducts as any} categories={categories} />
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-sm">
            <Tag size={14} className="text-crimson" />
            <span className="font-body text-xs text-white/60 uppercase tracking-widest">
              {offers.length} Productos en oferta
            </span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-crimson/10 border border-crimson/20 p-4 rounded-sm">
        <p className="font-body text-xs text-white/70 leading-relaxed">
          Aquí puedes ver todos los productos que tienen una oferta activa. 
          Para añadir nuevos productos a esta lista, ve a la sección de 
          <Link href="/admin/products" className="text-crimson hover:underline mx-1">
            Productos
          </Link> 
          y edita el artículo que deseas rebajar.
        </p>
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
            {offers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center font-body text-sm text-white/20"
                >
                  No hay ofertas activas en este momento.
                </td>
              </tr>
            ) : (
              offers.map((product: any) => (
                <AdminProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
