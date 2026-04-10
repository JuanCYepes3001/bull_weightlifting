import { getCategories } from "@/lib/queries/categories";
import { BulkProductsClient } from "./BulkProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Carga masiva | Admin" };

export default async function BulkProductsPage() {
  const categories = await getCategories().catch(() => []);
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
          Inventario
        </p>
        <h1 className="text-2xl text-white">CARGA MASIVA</h1>
        <p className="font-body text-sm text-white/30 mt-1">
          Agrega o elimina múltiples productos a la vez.
        </p>
      </div>
      <BulkProductsClient categories={categories} />
    </div>
  );
}
