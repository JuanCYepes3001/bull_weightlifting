"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Check } from "lucide-react";
import { createProductAction, updateProductAction } from "@/app/actions/products";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type ImageEntry } from "./ImageUploader";
import type { Category } from "@/types";

/* ─── Predefined data ─────────────────────────────────── */
const PREDEFINED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Talla Única"];

const PREDEFINED_COLORS = [
  { name: "Negro",        hex: "#111111" },
  { name: "Blanco",       hex: "#f0f0f0" },
  { name: "Gris",         hex: "#9ca3af" },
  { name: "Gris Oscuro",  hex: "#4b5563" },
  { name: "Rojo",         hex: "#dc2626" },
  { name: "Azul",         hex: "#3b82f6" },
  { name: "Azul Marino",  hex: "#1e3a8a" },
  { name: "Verde",        hex: "#16a34a" },
  { name: "Morado",       hex: "#7c3aed" },
  { name: "Rosado",       hex: "#ec4899" },
  { name: "Naranja",      hex: "#f97316" },
  { name: "Amarillo",     hex: "#eab308" },
  { name: "Café",         hex: "#78350f" },
  { name: "Beige",        hex: "#d4b896" },
  { name: "Camuflado",    hex: "#4a5240" },
];

/* ─── Schema ──────────────────────────────────────────── */
const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z
    .string()
    .min(2, "Slug requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Precio debe ser mayor a 0"),
  category_id: z.string().uuid("Selecciona una categoría"),
  gender: z.enum(["hombre", "mujer", "unisex"]).default("unisex"),
  is_active: z.boolean().default(true),
  is_on_sale: z.boolean().default(false),
  sale_price: z.coerce.number().nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  sale_start_at: z.string().nullable().optional(),
  sale_end_at: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

const GENDERS = [
  { value: "hombre",  label: "Hombre" },
  { value: "mujer",   label: "Mujer" },
  { value: "unisex",  label: "Unisex" },
] as const;

interface MatrixEntry { stock: number; sku: string; }

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    category_id: string;
    gender?: "hombre" | "mujer" | "unisex";
    is_active: boolean;
    is_on_sale?: boolean;
    sale_price?: number | null;
    discount_percent?: number | null;
    sale_start_at?: string | null;
    sale_end_at?: string | null;
    variants?: { size: string; color: string; color_hex?: string | null; stock: number; sku?: string | null }[];
    images?: { url: string; alt: string | null }[];
  };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const isEdit = !!product;
  const [serverError, setServerError] = useState<string | null>(null);

  /* ─── Variant state ──────────────────────────────────── */
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
  // matrix[colorName][sizeName] = { stock, sku }
  const [matrix, setMatrix] = useState<Record<string, Record<string, MatrixEntry>>>({});
  // Extra variants that use non-predefined colors/sizes
  const [customVariants, setCustomVariants] = useState<
    { size: string; color: string; color_hex: string; stock: number; sku: string }[]
  >([]);
  // Custom size/color inputs
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [customColorInput, setCustomColorInput] = useState({ name: "", hex: "#000000" });

  /* ─── Images ─────────────────────────────────────────── */
  const [images, setImages] = useState<ImageEntry[]>(
    (product?.images ?? []).map((img) => ({ url: img.url, alt: img.alt ?? "" }))
  );

  /* ─── Form ───────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      category_id: product?.category_id ?? "",
      gender: product?.gender ?? "unisex",
      is_active: product?.is_active ?? true,
      is_on_sale: product?.is_on_sale ?? false,
      sale_price: product?.sale_price ?? null,
      discount_percent: product?.discount_percent ?? null,
      sale_start_at: product?.sale_start_at
        ? new Date(product.sale_start_at).toISOString().slice(0, 16)
        : "",
      sale_end_at: product?.sale_end_at
        ? new Date(product.sale_end_at).toISOString().slice(0, 16)
        : "",
    },
  });

  const isOnSale = watch("is_on_sale");
  const price = watch("price");
  const discountPercent = watch("discount_percent");
  const salePrice = watch("sale_price");
  const nameValue = watch("name");

  // Auto-slug on create
  useEffect(() => {
    if (!isEdit && nameValue) setValue("slug", slugify(nameValue));
  }, [nameValue, isEdit, setValue]);

  // Auto-calculate sale price from discount
  useEffect(() => {
    if (isOnSale && discountPercent && price && !salePrice) {
      const calculated = price * (1 - discountPercent / 100);
      setValue("sale_price", Math.round(calculated / 100) * 100);
    }
  }, [isOnSale, discountPercent, price, setValue, salePrice]);

  // Load existing variants into matrix on edit
  useEffect(() => {
    if (!product?.variants?.length) return;

    const predefinedColorNames = new Set(PREDEFINED_COLORS.map((c) => c.name));
    const predefinedSizesSet = new Set(PREDEFINED_SIZES);

    const inGrid = product.variants.filter(
      (v) => predefinedColorNames.has(v.color) && predefinedSizesSet.has(v.size)
    );
    const custom = product.variants.filter(
      (v) => !predefinedColorNames.has(v.color) || !predefinedSizesSet.has(v.size)
    );

    const sizeSet = new Set<string>();
    const colorMap = new Map<string, string>(); // name → hex

    inGrid.forEach((v) => {
      sizeSet.add(v.size);
      colorMap.set(v.color, v.color_hex ?? "#111111");
    });

    setSelectedSizes(PREDEFINED_SIZES.filter((s) => sizeSet.has(s)));
    setSelectedColors(
      Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))
    );

    const m: Record<string, Record<string, MatrixEntry>> = {};
    inGrid.forEach((v) => {
      if (!m[v.color]) m[v.color] = {};
      m[v.color][v.size] = { stock: v.stock, sku: v.sku ?? "" };
    });
    setMatrix(m);

    setCustomVariants(
      custom.map((v) => ({
        size: v.size,
        color: v.color,
        color_hex: v.color_hex ?? "",
        stock: v.stock,
        sku: v.sku ?? "",
      }))
    );
  }, [product]);

  /* ─── Helpers ────────────────────────────────────────── */
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes((prev) => prev.filter((s) => s !== size));
      setMatrix((m) => {
        const newM = { ...m };
        for (const color in newM) {
          newM[color] = { ...newM[color] };
          delete newM[color][size];
        }
        return newM;
      });
    } else {
      setSelectedSizes((prev) => {
        const ordered = PREDEFINED_SIZES.filter((s) => [...prev, size].includes(s));
        return ordered;
      });
    }
  };

  const addCustomSize = () => {
    const s = customSizeInput.trim().toUpperCase();
    if (!s || selectedSizes.includes(s)) return;
    setSelectedSizes((prev) => [...prev, s]);
    setCustomSizeInput("");
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    if (selectedColors.find((c) => c.name === color.name)) {
      setSelectedColors((prev) => prev.filter((c) => c.name !== color.name));
      setMatrix((m) => {
        const newM = { ...m };
        delete newM[color.name];
        return newM;
      });
    } else {
      setSelectedColors((prev) => [...prev, color]);
    }
  };

  const addCustomColor = () => {
    const name = customColorInput.name.trim();
    if (!name || selectedColors.find((c) => c.name === name)) return;
    setSelectedColors((prev) => [...prev, { name, hex: customColorInput.hex }]);
    setCustomColorInput({ name: "", hex: "#000000" });
  };

  const updateMatrix = (colorName: string, size: string, field: "stock" | "sku", value: string | number) => {
    setMatrix((m) => ({
      ...m,
      [colorName]: {
        ...(m[colorName] ?? {}),
        [size]: {
          ...(m[colorName]?.[size] ?? { stock: 0, sku: "" }),
          [field]: value,
        },
      },
    }));
  };

  const updateCustomVariant = <K extends keyof (typeof customVariants)[0]>(
    i: number,
    key: K,
    val: (typeof customVariants)[0][K]
  ) =>
    setCustomVariants((v) =>
      v.map((item, idx) => (idx === i ? { ...item, [key]: val } : item))
    );

  const buildAllVariants = () => {
    const result: { size: string; color: string; color_hex: string; stock: number; sku: string }[] = [];
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const entry = matrix[color.name]?.[size] ?? { stock: 0, sku: "" };
        result.push({ size, color: color.name, color_hex: color.hex, stock: entry.stock, sku: entry.sku });
      }
    }
    result.push(...customVariants);
    return result;
  };

  /* ─── Submit ─────────────────────────────────────────── */
  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const formData = new FormData();
    // Skip null/undefined — String(null) = "null" which causes NaN in the server action
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, String(v));
      }
    });

    const allVariants = buildAllVariants();
    formData.append("variant_count", String(allVariants.length));
    allVariants.forEach((v, i) => {
      formData.append(`variant_size_${i}`, v.size);
      formData.append(`variant_color_${i}`, v.color);
      formData.append(`variant_color_hex_${i}`, v.color_hex);
      formData.append(`variant_stock_${i}`, String(v.stock));
      formData.append(`variant_sku_${i}`, v.sku);
    });

    formData.append("image_count", String(images.length));
    images.forEach((img, i) => {
      formData.append(`image_url_${i}`, img.url);
      formData.append(`image_alt_${i}`, img.alt);
    });

    const result = isEdit
      ? await updateProductAction(product!.id, formData)
      : await createProductAction(formData);

    if (result?.error) setServerError(result.error);
  };

  const totalVariants = selectedColors.length * selectedSizes.length + customVariants.length;

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      {/* ── Información básica ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Información básica
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" placeholder="Camiseta Bull Classic" error={errors.name?.message} {...register("name")} />
          <Input label="Slug (URL)" placeholder="camiseta-bull-classic" error={errors.slug?.message} {...register("slug")} />
        </div>
        <div>
          <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
            Descripción
          </label>
          <textarea
            rows={3}
            placeholder="Descripción del producto..."
            className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60 resize-none"
            {...register("description")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Precio (COP)" type="number" placeholder="89900" error={errors.price?.message} {...register("price")} />
          <div>
            <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
              Categoría
            </label>
            <select
              className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
              {...register("category_id")}
            >
              <option value="" className="bg-[#1a1a1a]">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">
                  {cat.name} — {cat.gender}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 font-body text-xs text-red-400">{errors.category_id.message}</p>
            )}
          </div>
        </div>
        {/* Género */}
        <div>
          <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
            Género
          </label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={g.value}
                  className="accent-crimson"
                  {...register("gender")}
                />
                <span className="font-body text-sm text-white/60">{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-crimson" {...register("is_active")} />
          <span className="font-body text-sm text-white/60">Producto activo (visible en tienda)</span>
        </label>
      </section>

      {/* ── Tallas ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Tallas disponibles
        </h2>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 font-body text-[11px] tracking-widest uppercase border transition-all ${
                  active
                    ? "bg-crimson border-crimson text-white"
                    : "bg-transparent border-white/15 text-white/40 hover:border-white/40 hover:text-white/70"
                }`}
              >
                {active && <Check size={9} className="inline mr-1" />}
                {size}
              </button>
            );
          })}
        </div>
        {/* Custom size */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
            placeholder="Talla personalizada (ej: 3XL)"
            className="bg-white/5 border border-white/10 px-3 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60 w-56"
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="flex items-center gap-1 font-body text-[10px] tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors"
          >
            <Plus size={11} /> Agregar
          </button>
        </div>
        {/* Show any non-predefined sizes selected */}
        {selectedSizes.filter(s => !PREDEFINED_SIZES.includes(s)).map(s => (
          <span key={s} className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 font-body text-[10px] text-white/60 mr-2">
            {s}
            <button type="button" onClick={() => toggleSize(s)} className="text-white/30 hover:text-red-400">
              <X size={9} />
            </button>
          </span>
        ))}
      </section>

      {/* ── Colores ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Colores disponibles
        </h2>
        <div className="flex flex-wrap gap-3">
          {PREDEFINED_COLORS.map((color) => {
            const active = !!selectedColors.find((c) => c.name === color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color)}
                title={color.name}
                className={`group flex flex-col items-center gap-1.5 transition-all ${
                  active ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    active ? "border-crimson scale-110" : "border-white/20"
                  }`}
                  style={{ background: color.hex }}
                >
                  {active && <Check size={11} className="text-white drop-shadow" />}
                </div>
                <span className="font-body text-[8px] tracking-wide text-white/50 uppercase max-w-[48px] text-center leading-tight">
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
        {/* Custom color */}
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={customColorInput.name}
            onChange={(e) => setCustomColorInput((c) => ({ ...c, name: e.target.value }))}
            placeholder="Nombre del color"
            className="bg-white/5 border border-white/10 px-3 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60 w-44"
          />
          <input
            type="color"
            value={customColorInput.hex}
            onChange={(e) => setCustomColorInput((c) => ({ ...c, hex: e.target.value }))}
            className="w-9 h-9 border border-white/10 bg-transparent cursor-pointer"
          />
          <button
            type="button"
            onClick={addCustomColor}
            className="flex items-center gap-1 font-body text-[10px] tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors"
          >
            <Plus size={11} /> Agregar
          </button>
        </div>
      </section>

      {/* ── Stock Matrix ─────────────────────────────────── */}
      {selectedColors.length > 0 && selectedSizes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
              Stock por variante
              <span className="ml-2 text-white/20">
                ({selectedColors.length} color{selectedColors.length !== 1 ? "es" : ""} × {selectedSizes.length} talla{selectedSizes.length !== 1 ? "s" : ""} = {totalVariants} variantes)
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 font-body text-[9px] tracking-widest uppercase text-white/30 w-32">
                    Color
                  </th>
                  {selectedSizes.map((size) => (
                    <th key={size} className="px-2 py-2 font-body text-[9px] tracking-widest uppercase text-white/30 text-center min-w-[60px]">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedColors.map((color) => (
                  <tr key={color.name} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                          style={{ background: color.hex }}
                        />
                        <span className="font-body text-[10px] text-white/70">{color.name}</span>
                      </div>
                    </td>
                    {selectedSizes.map((size) => (
                      <td key={size} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          value={matrix[color.name]?.[size]?.stock ?? 0}
                          onChange={(e) =>
                            updateMatrix(color.name, size, "stock", parseInt(e.target.value) || 0)
                          }
                          min={0}
                          className={`w-14 bg-white/5 border text-center px-1 py-1.5 font-body text-xs text-white focus:outline-none focus:border-crimson/60 transition-colors ${
                            (matrix[color.name]?.[size]?.stock ?? 0) === 0
                              ? "border-red-500/20 text-white/30"
                              : "border-white/10"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body text-[9px] text-white/20 uppercase tracking-wider">
            Rojo = sin stock · Escribe 0 para marcarlo como agotado en esa variante
          </p>
        </section>
      )}

      {/* ── Custom/extra variants ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
            Variantes adicionales
            {customVariants.length > 0 && (
              <span className="ml-2 text-white/20">({customVariants.length})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={() =>
              setCustomVariants((v) => [
                ...v,
                { size: "", color: "", color_hex: "#000000", stock: 0, sku: "" },
              ])
            }
            className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-crimson transition-colors"
          >
            <Plus size={11} /> Agregar
          </button>
        </div>
        {customVariants.length === 0 ? (
          <p className="font-body text-xs text-white/20 py-1">
            Para tallas/colores fuera de lo estándar. Opcional.
          </p>
        ) : (
          <div className="space-y-2">
            {customVariants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end p-3 bg-white/[0.02] border border-white/5">
                <div>
                  <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">Talla</label>
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => updateCustomVariant(i, "size", e.target.value)}
                    placeholder="S"
                    className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                  />
                </div>
                <div>
                  <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">Color</label>
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => updateCustomVariant(i, "color", e.target.value)}
                    placeholder="Negro"
                    className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                  />
                </div>
                <div>
                  <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">Hex</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={v.color_hex || "#000000"}
                      onChange={(e) => updateCustomVariant(i, "color_hex", e.target.value)}
                      className="w-7 h-7 border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={v.color_hex}
                      onChange={(e) => updateCustomVariant(i, "color_hex", e.target.value)}
                      placeholder="#000000"
                      className="flex-1 bg-white/5 border border-white/10 px-2 py-1.5 font-body text-[10px] text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateCustomVariant(i, "stock", parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white focus:outline-none focus:border-crimson/60"
                  />
                </div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateCustomVariant(i, "sku", e.target.value)}
                      placeholder="SKU"
                      className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-[10px] text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomVariants((v) => v.filter((_, idx) => idx !== i))}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Oferta ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Configuración de Oferta
        </h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-crimson" {...register("is_on_sale")} />
          <span className="font-body text-sm text-white/60">Activar Oferta para este producto</span>
        </label>
        {isOnSale && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
            <div>
              <Input
                label="Descuento (%)"
                type="number"
                placeholder="20"
                error={errors.discount_percent?.message}
                {...register("discount_percent")}
              />
              <p className="mt-1 font-body text-[9px] text-white/20 uppercase tracking-wider">
                Opcional: calcula el precio automáticamente
              </p>
            </div>
            <div>
              <Input
                label="Precio de Oferta (Final)"
                type="number"
                placeholder="71900"
                error={errors.sale_price?.message}
                {...register("sale_price")}
              />
              <p className="mt-1 font-body text-[9px] text-white/20 uppercase tracking-wider">
                Precio que verá el cliente
              </p>
            </div>
            <Input label="Fecha de Inicio" type="datetime-local" error={errors.sale_start_at?.message} {...register("sale_start_at")} />
            <Input label="Fecha de Fin"    type="datetime-local" error={errors.sale_end_at?.message}   {...register("sale_end_at")} />
          </div>
        )}
      </section>

      {/* ── Imágenes ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-white/5">
          <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
            Imágenes ({images.length})
          </h2>
          <p className="font-body text-[10px] text-white/20 mt-0.5">
            Sube archivos desde tu equipo o pega una URL externa.
          </p>
        </div>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {/* ── Submit ────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        {totalVariants > 0 && (
          <span className="font-body text-[10px] text-white/30 uppercase tracking-widest">
            {totalVariants} variante{totalVariants !== 1 ? "s" : ""}
          </span>
        )}
        <a
          href="/admin/products"
          className="ml-auto font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
