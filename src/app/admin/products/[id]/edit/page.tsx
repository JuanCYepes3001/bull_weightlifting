import { notFound } from "next/navigation";
import { getCategories } from "@/lib/queries/categories";
import { getProductByIdAdmin } from "@/lib/queries/admin";
import { ProductForm } from "../../ProductForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar producto | Admin" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getCategories().catch(() => []),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Inventario
        </p>
        <h1 className="text-2xl text-white">
          EDITAR: {product.name.toUpperCase()}
        </h1>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
