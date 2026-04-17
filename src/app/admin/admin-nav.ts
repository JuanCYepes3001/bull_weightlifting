import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Archive,
  BarChart2,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Analíticas",  href: "/admin/analytics",  icon: BarChart2 },
  { label: "Productos",   href: "/admin/products",   icon: Package },
  { label: "Inventario",  href: "/admin/inventory",  icon: Archive },
  { label: "Ofertas",     href: "/admin/offers",     icon: Tag },
  { label: "Órdenes",     href: "/admin/orders",     icon: ShoppingCart },
  { label: "Usuarios",    href: "/admin/users",      icon: Users },
];
