import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/products", icon: Package },
  { label: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
  { label: "Usuarios", href: "/admin/users", icon: Users },
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
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div>
            <p className="font-horizon text-[11px] tracking-widest text-crimson uppercase">
              Bull
            </p>
            <p className="font-body text-[9px] tracking-[0.3em] text-white/20 uppercase">
              Admin Panel
            </p>
          </div>
        </div>

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
        <div className="px-5 py-4 border-t border-white/5">
          <p className="font-body text-[10px] text-white/20 truncate">
            {profile.name ?? "Admin"}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 font-body text-[10px] tracking-widest text-white/20 hover:text-white/50 transition-colors uppercase"
            >
              Salir
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
