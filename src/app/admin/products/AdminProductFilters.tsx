"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Category } from "@/types";

interface Option { label: string; value: string }

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 bg-[#0D0D0D] border border-white/10 text-white font-body text-xs px-3 py-2 min-w-[160px] focus:outline-none focus:border-crimson/50 transition-colors"
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={11} className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute top-full left-0 right-0 mt-px bg-[#0D0D0D] border border-white/10 z-50 py-1">
          <li>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left font-body text-xs px-3 py-2 transition-colors ${
                value === "" ? "text-crimson" : "text-white/40 hover:text-white hover:bg-crimson/20"
              }`}
            >
              {placeholder}
            </button>
          </li>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left font-body text-xs px-3 py-2 transition-colors ${
                  value === o.value ? "text-crimson" : "text-white/40 hover:text-white hover:bg-crimson/20"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface AdminProductFiltersProps {
  categories: Category[];
  search?: string;
  categoryId?: string;
  status?: string;
  total: number;
}

export function AdminProductFilters({
  categories,
  search,
  categoryId,
  status,
  total,
}: AdminProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.category) sp.set("category", params.category);
    if (params.status) sp.set("status", params.status);
    router.push(`${pathname}?${sp.toString()}`);
  }

  const hasFilters = search || categoryId || status;

  const categoryOptions: Option[] = categories.map((c) => ({ label: c.name, value: c.id }));
  const statusOptions: Option[] = [
    { label: "Activos", value: "active" },
    { label: "Inactivos", value: "inactive" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Búsqueda */}
      <div className="relative flex-1 max-w-xs">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
            apply({ search: val, category: categoryId ?? "", status: status ?? "" });
          }}
        >
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Buscar producto..."
            className="w-full bg-[#0D0D0D] border border-white/10 text-white font-body text-xs pl-8 pr-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-crimson/50 transition-colors"
          />
        </form>
      </div>

      {/* Categoría */}
      <CustomSelect
        options={categoryOptions}
        value={categoryId ?? ""}
        onChange={(v) => apply({ search: search ?? "", category: v, status: status ?? "" })}
        placeholder="Todas las categorías"
      />

      {/* Estado */}
      <CustomSelect
        options={statusOptions}
        value={status ?? ""}
        onChange={(v) => apply({ search: search ?? "", category: categoryId ?? "", status: v })}
        placeholder="Todos los estados"
      />

      {/* Limpiar */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1.5 font-body text-xs text-white/30 hover:text-white transition-colors px-2"
        >
          <X size={12} />
          Limpiar
        </button>
      )}

      {/* Conteo */}
      <span className="font-body text-[10px] text-white/20 ml-auto">
        {total} producto{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
