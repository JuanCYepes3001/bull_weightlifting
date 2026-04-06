"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { deleteProductAction, toggleProductActiveAction } from "@/app/actions/products";

interface AdminProductRowProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    is_active: boolean;
    is_on_sale?: boolean;
    sale_price?: number | null;
    discount_percent?: number | null;
    category?: { name: string } | null;
    variants?: { id: string }[];
    images?: { url: string }[];
  };
}

export function AdminProductRow({ product }: AdminProductRowProps) {
  const [isActive, setIsActive] = useState(product.is_active);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleProductActiveAction(product.id, !isActive);
    if (!result.error) setIsActive((v) => !v);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteProductAction(product.id);
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      {/* Nombre */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-9 h-11 object-cover flex-shrink-0 bg-white/5"
            />
          ) : (
            <div className="w-9 h-11 bg-white/5 flex-shrink-0" />
          )}
          <div>
            <p className="font-horizon text-[11px] tracking-widest text-white uppercase">
              {product.name}
            </p>
            <p className="font-body text-[10px] text-white/30">{product.slug}</p>
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="px-4 py-3 font-body text-xs text-white/40">
        {product.category?.name ?? "—"}
      </td>

      {/* Precio */}
      <td className="px-4 py-3 font-bebas tracking-wider">
        {product.is_on_sale ? (
          <div className="flex flex-col">
            <span className="text-[10px] text-white/20 line-through">
              ${product.price.toLocaleString("es-CO")}
            </span>
            <span className="text-base text-crimson">
              ${product.sale_price?.toLocaleString("es-CO")}
              {product.discount_percent && (
                <span className="ml-2 text-[9px] bg-crimson/10 px-1 py-0.5 rounded-sm font-body">
                  -{product.discount_percent}%
                </span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-base text-white/80">
            ${product.price.toLocaleString("es-CO")}
          </span>
        )}
      </td>

      {/* Variantes */}
      <td className="px-4 py-3 font-body text-xs text-white/40">
        {product.variants?.length ?? 0} var.
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <span
          className={`inline-block font-body text-[9px] tracking-widest uppercase px-2 py-1 rounded-sm ${
            isActive
              ? "bg-green-400/10 text-green-400 border border-green-400/20"
              : "bg-white/5 text-white/30 border border-white/10"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleToggle}
            disabled={loading}
            title={isActive ? "Desactivar" : "Activar"}
            className="p-1.5 text-white/30 hover:text-white transition-colors disabled:opacity-40"
          >
            {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-1.5 text-white/30 hover:text-white transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
