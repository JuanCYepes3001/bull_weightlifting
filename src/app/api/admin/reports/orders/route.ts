import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth";
import ExcelJS from "exceljs";

const STATUS_ES: Record<string, string> = {
  pending:    "Pendiente",
  processing: "En proceso",
  shipped:    "Enviada",
  delivered:  "Entregada",
  cancelled:  "Cancelada",
  refunded:   "Reembolsada",
};

function escapeCSV(s: string) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

const EXCEL_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "ID",        key: "id",       width: 38 },
  { header: "Cliente",   key: "cliente",  width: 24 },
  { header: "Productos", key: "products", width: 50 },
  { header: "Total COP", key: "total",    width: 14 },
  { header: "Estado",    key: "estado",   width: 14 },
  { header: "Fecha",     key: "fecha",    width: 14 },
];

async function buildExcelBuffer(rows: object[]): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Órdenes");
  sheet.columns = EXCEL_COLUMNS;
  sheet.getRow(1).font = { bold: true };
  if (rows.length) sheet.addRows(rows);
  return workbook.xlsx.writeBuffer();
}

export async function GET(request: NextRequest) {
  const { profile } = await getServerUser();
  if (!profile || profile.role !== "admin") {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "excel" ? "excel" : "csv";
  const type   = searchParams.get("type") === "annual" ? "annual" : "monthly";
  const year   = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()), 10);
  const month  = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1), 10);

  const startDate =
    type === "annual"
      ? new Date(year, 0, 1)
      : new Date(year, month - 1, 1);

  const endDate =
    type === "annual"
      ? new Date(year + 1, 0, 1)
      : new Date(year, month, 1);

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, user_id, status, total, created_at")
    .gte("created_at", startDate.toISOString())
    .lt("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return new NextResponse("Error al obtener órdenes", { status: 500 });
  }

  const periodStr =
    type === "annual"
      ? String(year)
      : `${year}-${String(month).padStart(2, "0")}`;

  const HEADERS = ["ID", "Cliente", "Productos", "Total COP", "Estado", "Fecha"];

  if (!orders?.length) {
    if (format === "excel") {
      const buf = await buildExcelBuffer([]);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="ordenes-${periodStr}.xlsx"`,
        },
      });
    }
    return new NextResponse("\uFEFF" + HEADERS.join(",") + "\r\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ordenes-${periodStr}.csv"`,
      },
    });
  }

  const orderIds = orders.map((o) => o.id);
  const userIds  = [...new Set(orders.map((o) => o.user_id))];

  const [itemsRes, profilesRes] = await Promise.all([
    supabase
      .from("order_items")
      .select(`order_id, quantity, variant:product_variants(product:products(name))`)
      .in("order_id", orderIds),
    supabase
      .from("profiles")
      .select("user_id, name")
      .in("user_id", userIds),
  ]);

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.user_id, p.name ?? "—"])
  );

  const itemsByOrder = new Map<string, { name: string; qty: number }[]>();
  for (const item of itemsRes.data ?? []) {
    const name = (item.variant as any)?.product?.name ?? "?";
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id)!.push({ name, qty: item.quantity });
  }

  const dataRows = orders.map((order) => {
    const items    = itemsByOrder.get(order.id) ?? [];
    const products = items.length
      ? items.map((i) => `${i.name} x${i.qty}`).join("; ")
      : "—";
    const fecha = new Date(order.created_at).toLocaleDateString("es-CO", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    return {
      id:      order.id,
      cliente: profileMap.get(order.user_id) ?? "—",
      products,
      total:   Math.round(order.total),
      estado:  STATUS_ES[order.status] ?? order.status,
      fecha,
    };
  });

  if (format === "excel") {
    const buf = await buildExcelBuffer(dataRows);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ordenes-${periodStr}.xlsx"`,
      },
    });
  }

  const rows = dataRows.map((r) =>
    [
      escapeCSV(r.id),
      escapeCSV(r.cliente),
      escapeCSV(r.products),
      String(r.total),
      escapeCSV(r.estado),
      escapeCSV(r.fecha),
    ].join(",")
  );

  const csv = "\uFEFF" + [HEADERS.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ordenes-${periodStr}.csv"`,
    },
  });
}
