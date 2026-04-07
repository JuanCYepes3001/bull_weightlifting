import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
  Home,
  Tag,
  Archive,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard",   href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Productos",   href: "/admin/products",   icon: Package },
  { label: "Inventario",  href: "/admin/inventory",  icon: Archive },
  { label: "Ofertas",     href: "/admin/offers",     icon: Tag },
  { label: "Órdenes",     href: "/admin/orders",     icon: ShoppingCart },
  { label: "Usuarios",    href: "/admin/users",      icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[#0D0D0D]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Brand */}
        <Link href="/" className="h-16 flex items-center px-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
          <div className="group">
            <p className="font-horizon text-[11px] tracking-widest text-crimson uppercase">
              Bull
            </p>
            <p className="font-body text-[9px] tracking-[0.3em] text-white/20 uppercase group-hover:text-white/40 transition-colors">
              Admin Panel
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 font-body text-xs tracking-widest uppercase text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded-sm group"
            >
              <Icon size={14} className="flex-shrink-0" />
              {label}
              <ChevronRight
                size={10}
                className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity"
              />
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-5 py-6 border-t border-white/5 space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-body text-[10px] tracking-[0.2em] uppercase transition-all rounded-sm"
          >
            <Home size={12} />
            Salir a la Tienda
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left font-body text-[9px] tracking-widest text-white/20 hover:text-crimson/60 transition-colors uppercase"
            >
              Cerrar Sesión
              <span className="block opacity-50 lowercase tracking-normal bg-transparent mt-1">
                ({profile.name ?? "Admin"})
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
