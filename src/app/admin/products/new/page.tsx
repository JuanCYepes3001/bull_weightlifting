import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "../ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo producto | Admin" };

export default async function NewProductPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Inventario
        </p>
        <h1 className="text-2xl text-white">NUEVO PRODUCTO</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
