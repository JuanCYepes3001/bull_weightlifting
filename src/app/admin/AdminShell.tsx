"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, Menu, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { adminNav } from "./admin-nav";

interface AdminShellProps {
  adminName: string;
  children: React.ReactNode;
}

export function AdminShell({ adminName, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {adminNav.map(({ label, href, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 font-body text-xs tracking-widest uppercase transition-colors rounded-sm group ${
              active ? "text-white bg-white/5" : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={14} className="flex-shrink-0" />
            {label}
            <ChevronRight
              size={10}
              className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity"
            />
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#0D0D0D]">
      {/* Mobile top bar */}
      <div className="lg:hidden h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/5 sticky top-0 z-40 bg-[#0D0D0D]">
        <Link href="/" className="group">
          <p className="font-horizon text-[11px] tracking-widest text-crimson uppercase">Bull</p>
          <p className="font-body text-[8px] tracking-[0.3em] text-white/20 uppercase">Admin Panel</p>
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
          aria-label="Menú de administrador"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-[#0D0D0D]/98 backdrop-blur-md overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </nav>
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
                  ({adminName})
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 border-r border-white/5 flex-col h-screen overflow-y-auto sticky top-0">
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

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLinks />
        </nav>

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
                ({adminName})
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:overflow-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
