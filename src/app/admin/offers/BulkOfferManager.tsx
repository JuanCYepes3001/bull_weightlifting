"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Calendar, Percent, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { bulkUpdateOffersAction } from "@/app/actions/products";
import type { Category, Product } from "@/types";

interface BulkOfferManagerProps {
  products: Product[];
  categories: Category[];
}

export function BulkOfferManager({ products = [], categories = [] }: BulkOfferManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mostrar todos los productos activos, pero marcar disponibilidad
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
      const isActive = p.is_active !== false; // Solo mostrar si no están desactivados
      return matchSearch && matchCat && isActive;
    });
  }, [products, search, selectedCategory]);

  const availableProducts = filteredProducts.filter(p => !p.is_on_sale);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === availableProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableProducts.map((p) => p.id));
    }
  };

  const handleApply = async () => {
    if (selectedIds.length === 0) return setError("Selecciona al menos un producto");
    if (discount <= 0) return setError("El descuento debe ser mayor a 0");
    if (!endDate) return setError("Debes definir una fecha de fin");

    setLoading(true);
    setError(null);
    
    const result = await bulkUpdateOffersAction(
      selectedIds,
      discount,
      startDate,
      endDate
    );

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setSelectedIds([]);
      setDiscount(0);
      setStartDate("");
      setEndDate("");
      window.location.reload(); // Recargar para ver cambios
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-crimson hover:bg-crimson-light text-white font-body text-xs tracking-widest uppercase px-4 py-2.5 transition-colors shadow-lg shadow-crimson/20"
      >
        <Percent size={13} />
        Gestión Masiva
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden rounded-sm">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-white font-horizon tracking-widest uppercase">
              Crear Oferta Masiva
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
              {products.length} productos cargados · Selecciona productos sin oferta activa.
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/20 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Listado Left */}
          <div className="flex-1 flex flex-col border-r border-white/5 bg-white/[0.01]">
            <div className="p-4 space-y-4 border-b border-white/5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-crimson"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white font-body text-sm pl-10 pr-8 py-2 focus:outline-none focus:border-crimson appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#111]">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={selectAll}
                  className="font-body text-[10px] uppercase tracking-widest text-white/40 hover:text-crimson transition-colors"
                >
                  {selectedIds.length === availableProducts.length ? "Deseleccionar todo" : "Seleccionar visibles"}
                </button>
                <span className="font-body text-[10px] uppercase tracking-widest text-white/20">
                  {selectedIds.length} seleccionados
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 text-center">
                  <AlertCircle size={32} />
                  <p className="mt-2 font-body text-xs uppercase tracking-widest">No hay productos que coincidan</p>
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-2 rounded-sm transition-colors ${
                      p.is_on_sale 
                        ? "opacity-50 cursor-not-allowed bg-white/[0.02]" 
                        : "cursor-pointer hover:bg-white/5"
                    } ${selectedIds.includes(p.id) ? "bg-crimson/5 border-crimson/10" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="accent-crimson w-4 h-4 disabled:opacity-50"
                      checked={selectedIds.includes(p.id)}
                      disabled={p.is_on_sale}
                      onChange={() => !p.is_on_sale && toggleSelect(p.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-body text-xs text-white uppercase tracking-wider">{p.name}</p>
                        {p.is_on_sale && (
                          <span className="font-body text-[8px] px-1.5 py-0.5 bg-white/10 text-white/40 uppercase tracking-widest rounded-full">
                            Oferta Activa
                          </span>
                        )}
                      </div>
                      <p className="font-bebas text-[11px] text-white/30 tracking-widest">
                        PRECIO BASE: ${p.price.toLocaleString("es-CO")}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Settings Right */}
          <div className="w-full md:w-80 p-6 space-y-6 bg-black/40">
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-crimson font-bold border-b border-crimson/20 pb-2">
              Configuración
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-body text-[10px] uppercase tracking-widest text-white/40 mb-2">
                  Descuento Masivo (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 text-white font-bebas text-2xl p-4 text-center focus:outline-none focus:border-crimson"
                  />
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                </div>
              </div>

              <div>
                <label className="block font-body text-[10px] uppercase tracking-widest text-white/40 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white font-body text-sm p-3 focus:outline-none focus:border-crimson color-invert"
                />
              </div>

              <div>
                <label className="block font-body text-[10px] uppercase tracking-widest text-white/40 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white font-body text-sm p-3 focus:outline-none focus:border-crimson color-invert"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0" size={14} />
                <p className="text-[10px] text-red-500 font-body uppercase leading-tight">{error}</p>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleApply}
                loading={loading}
                disabled={selectedIds.length === 0}
                className="w-full h-14"
              >
                APLICAR A {selectedIds.length} PRODUCTOS
              </Button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full font-body text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
