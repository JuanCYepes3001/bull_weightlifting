"use client";

import { useState, useTransition, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Search,
  Minus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import {
  updateVariantStockAction,
  deleteVariantAction,
  addVariantToProductAction,
} from "@/app/actions/products";

/* ─── Types ─────────────────────────────────────────────── */
interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
  sku: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  category?: { name: string } | null;
  images?: { url: string }[];
  variants: Variant[];
}

interface Props {
  products: Product[];
}

const LOW_STOCK = 5;

function stockBadge(stock: number) {
  if (stock === 0)
    return (
      <span className="inline-block font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
        Sin stock
      </span>
    );
  if (stock <= LOW_STOCK)
    return (
      <span className="inline-block font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Bajo
      </span>
    );
  return null;
}

/* ─── Add variant form ──────────────────────────────────── */
function AddVariantForm({
  productId,
  onAdded,
  onCancel,
}: {
  productId: string;
  onAdded: (v: Variant) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState({
    size: "",
    color: "",
    color_hex: "#111111",
    stock: 0,
    sku: "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!data.size.trim() || !data.color.trim()) {
      setError("Talla y color son requeridos");
      return;
    }
    startTransition(async () => {
      const result = await addVariantToProductAction(productId, data);
      if (result.error) {
        setError(result.error);
      } else {
        onAdded({ id: result.id!, ...data, sku: data.sku || null });
      }
    });
  };

  return (
    <tr className="bg-crimson/5 border-t border-crimson/20">
      <td className="px-4 py-2" colSpan={5}>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block font-body text-[8px] tracking-widest uppercase text-white/30 mb-1">Talla *</label>
            <input
              type="text"
              value={data.size}
              onChange={(e) => setData((d) => ({ ...d, size: e.target.value }))}
              placeholder="M"
              className="w-16 bg-white/5 border border-white/15 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
            />
          </div>
          <div>
            <label className="block font-body text-[8px] tracking-widest uppercase text-white/30 mb-1">Color *</label>
            <input
              type="text"
              value={data.color}
              onChange={(e) => setData((d) => ({ ...d, color: e.target.value }))}
              placeholder="Negro"
              className="w-24 bg-white/5 border border-white/15 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
            />
          </div>
          <div className="flex items-end gap-1">
            <input
              type="color"
              value={data.color_hex}
              onChange={(e) => setData((d) => ({ ...d, color_hex: e.target.value }))}
              className="w-8 h-8 border border-white/10 bg-transparent cursor-pointer"
            />
          </div>
          <div>
            <label className="block font-body text-[8px] tracking-widest uppercase text-white/30 mb-1">Stock</label>
            <input
              type="number"
              value={data.stock}
              onChange={(e) => setData((d) => ({ ...d, stock: parseInt(e.target.value) || 0 }))}
              min={0}
              className="w-16 bg-white/5 border border-white/15 px-2 py-1.5 font-body text-xs text-white focus:outline-none focus:border-crimson/60"
            />
          </div>
          <div>
            <label className="block font-body text-[8px] tracking-widest uppercase text-white/30 mb-1">SKU</label>
            <input
              type="text"
              value={data.sku}
              onChange={(e) => setData((d) => ({ ...d, sku: e.target.value }))}
              placeholder="SKU-001"
              className="w-24 bg-white/5 border border-white/15 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="flex items-center gap-1 bg-crimson hover:bg-crimson-light disabled:opacity-50 text-white font-body text-[10px] tracking-widest uppercase px-3 py-1.5 transition-colors"
            >
              <Check size={11} />
              {pending ? "..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-white/30 hover:text-white transition-colors p-1.5"
            >
              <X size={14} />
            </button>
          </div>
          {error && <p className="font-body text-xs text-red-400 w-full">{error}</p>}
        </div>
      </td>
    </tr>
  );
}

/* ─── Variant Row ───────────────────────────────────────── */
function VariantRow({
  variant,
  onDelete,
  onStockChange,
}: {
  variant: Variant;
  onDelete: (id: string) => void;
  onStockChange: (id: string, newStock: number) => void;
}) {
  const [stock, setStock] = useState(variant.stock);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = (newStock: number) => {
    startTransition(async () => {
      await updateVariantStockAction(variant.id, newStock);
      onStockChange(variant.id, newStock);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const adjust = (delta: number) => {
    const newStock = Math.max(0, stock + delta);
    setStock(newStock);
    save(newStock);
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar variante ${variant.color} ${variant.size}?`)) return;
    startTransition(async () => {
      await deleteVariantAction(variant.id);
      onDelete(variant.id);
    });
  };

  return (
    <tr className="border-t border-white/[0.04] hover:bg-white/[0.015] transition-colors group">
      {/* Color */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
            style={{ background: variant.color_hex ?? "#333" }}
          />
          <span className="font-body text-[11px] text-white/70">{variant.color}</span>
        </div>
      </td>

      {/* Size */}
      <td className="px-4 py-2 font-body text-[11px] text-white/60">{variant.size}</td>

      {/* SKU */}
      <td className="px-4 py-2 font-body text-[10px] text-white/30">{variant.sku ?? "—"}</td>

      {/* Stock */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={pending || stock === 0}
            className="w-6 h-6 flex items-center justify-center border border-white/10 text-white/40 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all"
          >
            <Minus size={9} />
          </button>

          {editing ? (
            <input
              type="number"
              value={stock}
              min={0}
              autoFocus
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              onBlur={() => {
                setEditing(false);
                if (stock !== variant.stock) save(stock);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditing(false);
                  save(stock);
                }
                if (e.key === "Escape") {
                  setStock(variant.stock);
                  setEditing(false);
                }
              }}
              className="w-14 text-center bg-white/10 border border-crimson/60 px-1 py-0.5 font-body text-xs text-white focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`w-14 text-center font-bebas text-lg tracking-wider transition-colors ${
                stock === 0 ? "text-red-400" : stock <= LOW_STOCK ? "text-amber-400" : "text-white"
              } hover:text-crimson`}
              title="Click para editar"
            >
              {pending ? "…" : saved ? "✓" : stock}
            </button>
          )}

          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={pending}
            className="w-6 h-6 flex items-center justify-center border border-white/10 text-white/40 hover:border-white/30 hover:text-white disabled:opacity-30 transition-all"
          >
            <Plus size={9} />
          </button>

          {stockBadge(stock)}

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/60 transition-all ml-1"
            title="Editar stock"
          >
            <Pencil size={10} />
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-40 p-1"
          title="Eliminar variante"
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  );
}

/* ─── Product Row ───────────────────────────────────────── */
function ProductRow({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(product.variants);
  const [addingVariant, setAddingVariant] = useState(false);

  const totalStock = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
  const outCount = variants.filter((v) => v.stock === 0).length;
  const lowCount = variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK).length;

  const handleDelete = (id: string) =>
    setVariants((vs) => vs.filter((v) => v.id !== id));

  const handleStockChange = (id: string, newStock: number) =>
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, stock: newStock } : v)));

  return (
    <>
      {/* Product header row */}
      <tr
        className={`border-b border-white/5 cursor-pointer transition-colors ${
          expanded ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Name */}
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
              <p className="font-body text-[10px] text-white/30">
                {product.category?.name ?? "—"}
              </p>
            </div>
          </div>
        </td>

        {/* Variants */}
        <td className="px-4 py-3 font-body text-xs text-white/40">
          {variants.length} var.
        </td>

        {/* Total stock */}
        <td className="px-4 py-3">
          <span
            className={`font-bebas text-xl tracking-wider ${
              totalStock === 0 ? "text-red-400" : "text-white/80"
            }`}
          >
            {totalStock}
          </span>
        </td>

        {/* Status indicators */}
        <td className="px-4 py-3">
          <div className="flex gap-1.5 flex-wrap">
            {outCount > 0 && (
              <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
                {outCount} sin stock
              </span>
            )}
            {lowCount > 0 && (
              <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {lowCount} bajo
              </span>
            )}
            {outCount === 0 && lowCount === 0 && variants.length > 0 && (
              <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20">
                OK
              </span>
            )}
          </div>
        </td>

        {/* Expand toggle */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center gap-3 justify-end">
            <a
              href={`/admin/products/${product.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="font-body text-[9px] tracking-widest uppercase text-white/20 hover:text-white/60 transition-colors"
            >
              Editar
            </a>
            <span className="text-white/30">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded variants */}
      {expanded && (
        <>
          {/* Column sub-header */}
          <tr className="bg-white/[0.02]">
            <td colSpan={5} className="px-4 py-0">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 font-body text-[8px] tracking-[0.25em] uppercase text-white/25 w-40">Color</th>
                    <th className="text-left px-4 py-2 font-body text-[8px] tracking-[0.25em] uppercase text-white/25 w-20">Talla</th>
                    <th className="text-left px-4 py-2 font-body text-[8px] tracking-[0.25em] uppercase text-white/25 w-28">SKU</th>
                    <th className="text-left px-4 py-2 font-body text-[8px] tracking-[0.25em] uppercase text-white/25">Stock</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <VariantRow
                      key={v.id}
                      variant={v}
                      onDelete={handleDelete}
                      onStockChange={handleStockChange}
                    />
                  ))}
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 font-body text-xs text-white/20 text-center">
                        Sin variantes. Agrega una.
                      </td>
                    </tr>
                  )}
                  {addingVariant ? (
                    <AddVariantForm
                      productId={product.id}
                      onAdded={(v) => {
                        setVariants((vs) => [...vs, v]);
                        setAddingVariant(false);
                      }}
                      onCancel={() => setAddingVariant(false)}
                    />
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => setAddingVariant(true)}
                          className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-crimson transition-colors"
                        >
                          <Plus size={11} /> Agregar variante
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </>
      )}
    </>
  );
}

/* ─── Main Manager ──────────────────────────────────────── */
export function InventoryManager({ products: initialProducts }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "out" | "low">("all");

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "out") {
        return (p.variants ?? []).some((v) => v.stock === 0);
      }
      if (filter === "low") {
        return (p.variants ?? []).some((v) => v.stock > 0 && v.stock <= LOW_STOCK);
      }
      return true;
    });
  }, [initialProducts, search, filter]);

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {(["all", "out", "low"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`font-body text-[10px] tracking-widest uppercase px-3 py-2.5 border transition-colors ${
                filter === f
                  ? f === "out"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : f === "low"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-white/5 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {f === "all" ? "Todos" : f === "out" ? "Sin stock" : "Stock bajo"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {["Producto", "Variantes", "Stock total", "Estado", ""].map((h) => (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center font-body text-sm text-white/20">
                  {search || filter !== "all"
                    ? "No hay productos que coincidan con el filtro."
                    : "No hay productos con inventario."}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <ProductRow key={product.id} product={product as Product} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="font-body text-[9px] text-white/20 uppercase tracking-widest">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""} · click en una fila para gestionar variantes
      </p>
    </div>
  );
}
