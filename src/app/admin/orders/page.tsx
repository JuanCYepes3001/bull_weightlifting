import { getAdminOrders } from "@/lib/queries/admin";
import OrdersClient from "./OrdersClient";
import { ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Órdenes | Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  const orders = await getAdminOrders(status !== "all" ? status : undefined).catch(
    () => []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
            Ventas
          </p>
          <h1 className="text-2xl text-white flex items-center gap-3">
            ÓRDENES
            <ShoppingCart size={18} className="text-white/20" />
          </h1>
        </div>
      </div>

      <OrdersClient orders={orders} activeStatus={status} />
    </div>
  );
}
