"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { createProductAction, updateProductAction } from "@/app/actions/products";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type ImageEntry } from "./ImageUploader";
import type { Category } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z
    .string()
    .min(2, "Slug requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Precio debe ser mayor a 0"),
  category_id: z.string().uuid("Selecciona una categoría"),
  is_active: z.boolean().default(true),
  is_on_sale: z.boolean().default(false),
  sale_price: z.coerce.number().nullable().optional(),
  discount_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  sale_start_at: z.string().nullable().optional(),
  sale_end_at: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface VariantState {
  id?: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  sku: string;
}


interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    category_id: string;
    is_active: boolean;
    is_on_sale?: boolean;
    sale_price?: number | null;
    discount_percent?: number | null;
    sale_start_at?: string | null;
    sale_end_at?: string | null;
    variants?: { id: string; size: string; color: string; color_hex?: string | null; stock: number; sku?: string | null }[];
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

  const [variants, setVariants] = useState<VariantState[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size ?? "",
      color: v.color ?? "",
      color_hex: v.color_hex ?? "",
      stock: v.stock ?? 0,
      sku: v.sku ?? "",
    }))
  );

  const [images, setImages] = useState<ImageEntry[]>(
    (product?.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt ?? "",
    }))
  );

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
      is_active: product?.is_active ?? true,
      is_on_sale: product?.is_on_sale ?? false,
      sale_price: product?.sale_price ?? null,
      discount_percent: product?.discount_percent ?? null,
      sale_start_at: product?.sale_start_at ? new Date(product.sale_start_at).toISOString().slice(0, 16) : "",
      sale_end_at: product?.sale_end_at ? new Date(product.sale_end_at).toISOString().slice(0, 16) : "",
    },
  });
  
  const isOnSale = watch("is_on_sale");
  const price = watch("price");
  const discountPercent = watch("discount_percent");
  const salePrice = watch("sale_price");

  // Función para redondear a precio "bonito" (terminado en 00 o 900)
  const roundToNicePrice = (val: number) => {
    return Math.round(val / 100) * 100;
  };

  useEffect(() => {
    if (isOnSale && discountPercent && price && !salePrice) {
      const calculated = price * (1 - discountPercent / 100);
      setValue("sale_price", roundToNicePrice(calculated));
    }
  }, [isOnSale, discountPercent, price, setValue, salePrice]);

  const nameValue = watch("name");

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, isEdit, setValue]);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, String(v));
      }
    });

    formData.append("variant_count", String(variants.length));
    variants.forEach((v, i) => {
      if (v.id) formData.append(`variant_id_${i}`, v.id);
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

  const addVariant = () =>
    setVariants((v) => [
      ...v,
      { size: "", color: "", color_hex: "#000000", stock: 0, sku: "" },
    ]);

  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));

  const updateVariant = <K extends keyof VariantState>(
    i: number,
    key: K,
    val: VariantState[K]
  ) =>
    setVariants((v) =>
      v.map((item, idx) => (idx === i ? { ...item, [key]: val } : item))
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      {/* Información básica */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Información básica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Camiseta Bull Classic"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Slug (URL)"
            placeholder="camiseta-bull-classic"
            error={errors.slug?.message}
            {...register("slug")}
          />
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
          <Input
            label="Precio (COP)"
            type="number"
            placeholder="89900"
            error={errors.price?.message}
            {...register("price")}
          />

          <div>
            <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
              Categoría
            </label>
            <select
              className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
              {...register("category_id")}
            >
              <option value="" className="bg-[#1a1a1a]">
                Seleccionar categoría
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 font-body text-xs text-red-400">
                {errors.category_id.message}
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 accent-crimson"
            {...register("is_active")}
          />
          <span className="font-body text-sm text-white/60">
            Producto activo (visible en tienda)
          </span>
        </label>
      </section>

      {/* Oferta */}
      <section className="space-y-4">
        <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40 pb-2 border-b border-white/5">
          Configuración de Oferta
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-crimson"
              {...register("is_on_sale")}
            />
            <span className="font-body text-sm text-white/60">
              Activar Oferta para este producto
            </span>
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
                  Opcional: Calcula el precio automáticamente
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
              <div>
                <Input
                  label="Fecha de Inicio"
                  type="datetime-local"
                  error={errors.sale_start_at?.message}
                  {...register("sale_start_at")}
                />
              </div>
              <div>
                <Input
                  label="Fecha de Fin"
                  type="datetime-local"
                  error={errors.sale_end_at?.message}
                  {...register("sale_end_at")}
                />
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Variantes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
            Variantes ({variants.length})
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors"
          >
            <Plus size={11} /> Agregar
          </button>
        </div>

        {variants.length === 0 && (
          <p className="font-body text-xs text-white/20 py-2">
            Sin variantes. Agrega tallas y colores disponibles.
          </p>
        )}

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-2 items-end p-3 bg-white/[0.02] border border-white/5"
            >
              <div>
                <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                  Talla
                </label>
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  placeholder="S"
                  className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                />
              </div>
              <div>
                <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={v.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                  placeholder="Negro"
                  className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                />
              </div>
              <div>
                <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                  Hex
                </label>
                <div className="flex gap-1 items-center">
                  <input
                    type="color"
                    value={v.color_hex || "#000000"}
                    onChange={(e) =>
                      updateVariant(i, "color_hex", e.target.value)
                    }
                    className="w-7 h-7 border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={v.color_hex}
                    onChange={(e) =>
                      updateVariant(i, "color_hex", e.target.value)
                    }
                    placeholder="#000000"
                    className="flex-1 bg-white/5 border border-white/10 px-2 py-1.5 font-body text-[10px] text-white placeholder-white/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", parseInt(e.target.value) || 0)
                  }
                  min={0}
                  className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-xs text-white focus:outline-none focus:border-crimson/60"
                />
              </div>
              <div className="flex items-end gap-1">
                <div className="flex-1">
                  <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    placeholder="SKU"
                    className="w-full bg-white/5 border border-white/10 px-2 py-1.5 font-body text-[10px] text-white placeholder-white/20 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Imágenes */}
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

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <a
          href="/admin/products"
          className="font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
