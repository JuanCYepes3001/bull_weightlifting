import type { Metadata } from "next";
import { getAdminProducts, getAdminCategories } from "@/lib/queries/admin";
import { InventoryManager } from "./InventoryManager";
import CategoryManager from "./CategoryManager";

export const metadata: Metadata = { title: "Inventario | Admin" };

export default async function InventoryPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts().catch(() => []),
    getAdminCategories().catch(() => []),
  ]);

  // Variant-level stats
  const totalVariants = products.reduce((s, p) => s + (p.variants?.length ?? 0), 0);
  const totalStock    = products.reduce(
    (s, p) => s + (p.variants ?? []).reduce((vs, v) => vs + (v.stock ?? 0), 0),
    0
  );
  const outOfStock = products.reduce(
    (s, p) => s + (p.variants ?? []).filter((v) => (v.stock ?? 0) === 0).length,
    0
  );
  const lowStock = products.reduce(
    (s, p) =>
      s + (p.variants ?? []).filter((v) => (v.stock ?? 0) > 0 && (v.stock ?? 0) <= 5).length,
    0
  );
  const withStock = totalVariants - outOfStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Control de Stock
        </p>
        <h1 className="text-2xl text-white">INVENTARIO</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Productos",    value: products.length, color: "text-white" },
          { label: "Categorías",   value: categories.length, color: "text-white" },
          { label: "Con stock",    value: withStock,  color: "text-green-400" },
          { label: "Sin stock",    value: outOfStock, color: outOfStock > 0 ? "text-red-400" : "text-white/30" },
          { label: "Stock bajo",   value: lowStock,   color: lowStock > 0 ? "text-amber-400" : "text-white/30" },
          { label: "Stock total",  value: totalStock, color: "text-white/70" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 px-4 py-4">
            <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">
              {stat.label}
            </p>
            <p className={`font-bebas text-3xl tracking-wider ${stat.color}`}>
              {stat.value.toLocaleString("es-CO")}
            </p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock > 0 && (
        <div className="flex items-center gap-3 border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <p className="font-body text-xs text-amber-400/80">
            {lowStock} variante{lowStock !== 1 ? "s" : ""} con stock bajo (≤ 5 unidades)
          </p>
        </div>
      )}

      {/* Category manager */}
      <div className="space-y-1">
        <p className="font-body text-[9px] tracking-[0.4em] uppercase text-white/20 px-1">
          Filtros de productos
        </p>
        <CategoryManager categories={categories as any} />
      </div>

      {/* Collection section (empty — for future campaigns/seasons) */}
      <div className="border border-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/10" />
            <h3 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
              Colección (0)
            </h3>
          </div>
          <span className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/5 text-white/20">
            Próximamente
          </span>
        </div>
        <p className="font-body text-xs text-white/20">
          Esta sección se usará para campañas de temporada, drops y colecciones especiales. Actualmente vacía.
        </p>
      </div>

      {/* Product inventory manager */}
      <InventoryManager products={products as any} />
    </div>
  );
}
