"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { bulkCreateProductsAction, type BulkProductInput } from "@/app/actions/products";
import type { Category } from "@/types";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Talla Única"];
const PRESET_COLORS = ["Negro", "Blanco", "Gris", "Rojo", "Azul", "Verde", "Morado", "Rosado", "Naranja", "Café"];

interface RowState extends BulkProductInput {
  _id: number;
}

const emptyRow = (id: number): RowState => ({
  _id: id,
  name: "",
  price: 0,
  category_id: "",
  description: "",
  sizes: [],
  colors: [],
  stock: 10,
});

interface Props {
  categories: Category[];
}

function ProductRow({
  row,
  categories,
  onChange,
  onRemove,
}: {
  row: RowState;
  categories: Category[];
  onChange: (updated: RowState) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleSize = (s: string) =>
    onChange({
      ...row,
      sizes: row.sizes.includes(s) ? row.sizes.filter((x) => x !== s) : [...row.sizes, s],
    });

  const toggleColor = (c: string) =>
    onChange({
      ...row,
      colors: row.colors.includes(c) ? row.colors.filter((x) => x !== c) : [...row.colors, c],
    });

  const variantCount = row.sizes.length * row.colors.length;

  return (
    <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Main row */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-end">
        {/* Name */}
        <div>
          <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={row.name}
            onChange={(e) => onChange({ ...row, name: e.target.value })}
            placeholder="Camiseta Bull Classic"
            className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
            Precio (COP) *
          </label>
          <input
            type="number"
            value={row.price || ""}
            onChange={(e) => onChange({ ...row, price: parseFloat(e.target.value) || 0 })}
            placeholder="89900"
            className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
            Categoría *
          </label>
          <select
            value={row.category_id}
            onChange={(e) => onChange({ ...row, category_id: e.target.value })}
            className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
          >
            <option value="" className="bg-[#1a1a1a]">Seleccionar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">
                {cat.name} — {cat.gender}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-end gap-2 pb-px">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 font-body text-[9px] tracking-widest uppercase text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-2 py-2 transition-colors"
            title="Tallas, colores y stock"
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {variantCount > 0 ? `${variantCount} var.` : "Vars"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-white/20 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded: sizes, colors, stock */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-4 bg-white/[0.01]">
          {/* Description */}
          <div>
            <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={row.description ?? ""}
              onChange={(e) => onChange({ ...row, description: e.target.value })}
              placeholder="Descripción breve..."
              className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-2">
              Tallas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-2.5 py-1 font-body text-[10px] tracking-widest uppercase border transition-all ${
                    row.sizes.includes(s)
                      ? "bg-crimson border-crimson text-white"
                      : "bg-transparent border-white/15 text-white/40 hover:border-white/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-2">
              Colores
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  className={`px-2.5 py-1 font-body text-[10px] tracking-widest uppercase border transition-all ${
                    row.colors.includes(c)
                      ? "bg-crimson border-crimson text-white"
                      : "bg-transparent border-white/15 text-white/40 hover:border-white/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                Stock inicial por variante
              </label>
              <input
                type="number"
                value={row.stock}
                onChange={(e) => onChange({ ...row, stock: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-24 bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
              />
            </div>
            {variantCount > 0 && (
              <p className="font-body text-xs text-white/30 mt-4">
                → {variantCount} variantes × {row.stock} uds = {variantCount * row.stock} uds totales
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BulkProductsClient({ categories }: Props) {
  const [rows, setRows] = useState<RowState[]>([emptyRow(1)]);
  const [nextId, setNextId] = useState(2);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ created?: number; errors?: string[] } | null>(null);

  const addRow = () => {
    setRows((r) => [...r, emptyRow(nextId)]);
    setNextId((n) => n + 1);
  };

  const updateRow = (id: number, updated: RowState) =>
    setRows((r) => r.map((row) => (row._id === id ? updated : row)));

  const removeRow = (id: number) =>
    setRows((r) => r.filter((row) => row._id !== id));

  const handleSubmit = () => {
    const valid = rows.filter((r) => r.name && r.price > 0 && r.category_id);
    if (!valid.length) {
      setResult({ errors: ["Completa al menos un producto con nombre, precio y categoría."] });
      return;
    }

    startTransition(async () => {
      setResult(null);
      const res = await bulkCreateProductsAction(valid);
      setResult({ created: res.created, errors: res.errors });
      if (res.created) {
        // Clear successfully created rows
        setRows([emptyRow(nextId)]);
        setNextId((n) => n + 1);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Result feedback */}
      {result && (
        <div className={`border px-4 py-3 space-y-1 ${result.created ? "border-green-500/25 bg-green-500/5" : "border-red-500/25 bg-red-500/5"}`}>
          {result.created !== undefined && result.created > 0 && (
            <div className="flex items-center gap-2">
              <Check size={13} className="text-green-400" />
              <p className="font-body text-sm text-green-400">
                {result.created} producto{result.created !== 1 ? "s" : ""} creado{result.created !== 1 ? "s" : ""} exitosamente.
              </p>
            </div>
          )}
          {result.errors?.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <AlertCircle size={12} className="text-red-400 shrink-0" />
              <p className="font-body text-xs text-red-400">{e}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <ProductRow
            key={row._id}
            row={row}
            categories={categories}
            onChange={(updated) => updateRow(row._id, updated)}
            onRemove={() => removeRow(row._id)}
          />
        ))}
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addRow}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-crimson/40 text-white/30 hover:text-crimson py-3 font-body text-[10px] tracking-widest uppercase transition-colors"
      >
        <Plus size={12} />
        Agregar otro producto
      </button>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="bg-crimson hover:bg-crimson-light disabled:opacity-50 text-white font-body text-xs tracking-widest uppercase px-6 py-3 transition-colors"
        >
          {pending ? "Creando..." : `Crear ${rows.filter((r) => r.name && r.price > 0 && r.category_id).length || ""} producto${rows.filter((r) => r.name).length !== 1 ? "s" : ""}`}
        </button>
        <a
          href="/admin/products"
          className="font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
        >
          Cancelar
        </a>
        <p className="ml-auto font-body text-[9px] text-white/20 uppercase tracking-widest">
          {rows.length} fila{rows.length !== 1 ? "s" : ""} · Expande cada fila para agregar tallas, colores y stock
        </p>
      </div>
    </div>
  );
}
