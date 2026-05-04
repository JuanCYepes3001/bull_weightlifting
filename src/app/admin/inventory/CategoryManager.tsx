"use client";

import { useState, useTransition } from "react";
import { Plus, X, Tag, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/app/actions/products";

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
}

const GENDER_LABELS: Record<string, string> = {
  hombre: "Hombre",
  mujer:  "Mujer",
  unisex: "Unisex",
};

export default function CategoryManager({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", gender: "unisex" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleteError(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
      setDeletingId(null);
    });
    setDeletingId(id);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("gender", form.gender);

    startTransition(async () => {
      const res = await createCategoryAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setForm({ name: "", gender: "unisex" });
        setTimeout(() => {
          setSuccess(false);
          setShowForm(false);
          // Reload to reflect new category
          window.location.reload();
        }, 1000);
      }
    });
  };

  return (
    <div className="border border-white/5 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-white/30" />
          <h3 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
            Categorías ({categories.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
        >
          {showForm ? <X size={11} /> : <Plus size={11} />}
          {showForm ? "Cancelar" : "Nueva categoría"}
        </button>
      </div>

      {/* New category form */}
      {showForm && (
        <form
          onSubmit={submit}
          className="border border-white/5 bg-white/[0.02] p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Camisetas"
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
              />
            </div>
            <div>
              <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                Género *
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
              >
                <option value="hombre"  className="bg-[#1a1a1a]">Hombre</option>
                <option value="mujer"   className="bg-[#1a1a1a]">Mujer</option>
                <option value="unisex"  className="bg-[#1a1a1a]">Unisex</option>
              </select>
            </div>
          </div>

          {error && <p className="font-body text-xs text-red-400">{error}</p>}
          {success && (
            <p className="font-body text-xs text-green-400">
              ✓ Categoría creada exitosamente
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="font-body text-xs tracking-widest uppercase px-4 py-2 bg-crimson hover:bg-crimson-light text-white transition-colors disabled:opacity-50"
          >
            {pending ? "Creando…" : "Crear categoría"}
          </button>
        </form>
      )}

      {/* Delete error */}
      {deleteError && (
        <p className="font-body text-xs text-red-400">{deleteError}</p>
      )}

      {/* Category list */}
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="font-body text-xs text-white/20">Sin categorías.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/5 bg-white/[0.02] group"
            >
              <span className="font-horizon text-[10px] tracking-widest text-white/70">
                {cat.name}
              </span>
              <span className="font-body text-[8px] tracking-widest uppercase text-white/25">
                {GENDER_LABELS[cat.gender] ?? cat.gender}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={deletingId === cat.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-white/20 hover:text-red-400 disabled:opacity-30"
                title="Eliminar categoría"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
