"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { AdminProductRow } from "./AdminProductRow";
import { bulkDeleteProductsAction } from "@/app/actions/products";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  is_on_sale?: boolean;
  sale_price?: number | null;
  discount_percent?: number | null;
  category?: { name: string } | null;
  variants?: { id: string; stock?: number }[];
  images?: { url: string }[];
}

interface Props {
  products: Product[];
  lowStockIds?: Set<string>; // productIds that have at least one low-stock variant
}

export function AdminProductsTable({ products, lowStockIds }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    if (
      !confirm(
        `¿Eliminar ${selected.size} producto${selected.size !== 1 ? "s" : ""}? Esta acción no se puede deshacer.`
      )
    )
      return;

    startTransition(async () => {
      await bulkDeleteProductsAction(Array.from(selected));
      setSelected(new Set());
      // Trigger a reload since this is a server-managed page
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selected.size > 0 ? (
            <>
              <span className="font-body text-xs text-white/50">
                {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={pending}
                className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 size={11} />
                {pending ? "Eliminando..." : "Eliminar selección"}
              </button>
            </>
          ) : (
            <p className="font-body text-[10px] text-white/20 uppercase tracking-widest">
              {products.length} producto{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/bulk"
            className="font-body text-[10px] tracking-widest uppercase text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 transition-colors"
          >
            Carga masiva
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-crimson hover:bg-crimson-light text-white font-body text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
          >
            <Plus size={13} />
            Nuevo producto
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-crimson cursor-pointer"
                  title="Seleccionar todos"
                />
              </th>
              {["Producto", "Categoría", "Precio", "Variantes", "Estado", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-body text-[10px] tracking-[0.25em] uppercase text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-body text-sm text-white/20">
                  No hay productos. Crea el primero.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={selected.has(product.id) ? "bg-crimson/5" : undefined}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="w-3.5 h-3.5 accent-crimson cursor-pointer"
                    />
                  </td>
                  <AdminProductRow
                    key={product.id}
                    product={product}
                    hasLowStock={lowStockIds?.has(product.id)}
                    asTableCells
                  />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
