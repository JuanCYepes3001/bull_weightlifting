"use client";

import type { CartCustomization } from "@/store/cartStore";

interface TrusasCustomizerProps {
  value: CartCustomization;
  onChange: (v: CartCustomization) => void;
}

const PRINT_COLORS = [
  { label: "Blanco",   value: "blanco",   hex: "#FFFFFF" },
  { label: "Negro",    value: "negro",    hex: "#111111" },
  { label: "Rojo",     value: "rojo",     hex: "#DC2626" },
  { label: "Dorado",   value: "dorado",   hex: "#D97706" },
  { label: "Plateado", value: "plateado", hex: "#9CA3AF" },
];

export function TrusasCustomizer({ value, onChange }: TrusasCustomizerProps) {
  return (
    <div className="border border-crimson/20 bg-crimson/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
        <p className="font-impact text-[10px] tracking-[0.4em] text-crimson uppercase">
          Personalización
        </p>
      </div>

      <p className="font-body text-xs text-white/40 leading-relaxed">
        Agrega tu nombre, número y color de estampado. Todos los campos son opcionales.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
            Nombre
          </label>
          <input
            type="text"
            maxLength={16}
            placeholder="Ej. Juan"
            value={value.name ?? ""}
            onChange={(e) => onChange({ ...value, name: e.target.value || undefined })}
            className="w-full bg-white/5 border border-white/10 focus:border-crimson/50 outline-none px-3 py-2 font-body text-sm text-white placeholder:text-white/20 transition-colors"
          />
        </div>

        {/* Número */}
        <div className="space-y-1.5">
          <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
            Número
          </label>
          <input
            type="text"
            maxLength={3}
            placeholder="Ej. 10"
            value={value.number ?? ""}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              onChange({ ...value, number: v || undefined });
            }}
            className="w-full bg-white/5 border border-white/10 focus:border-crimson/50 outline-none px-3 py-2 font-body text-sm text-white placeholder:text-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Color de estampado */}
      <div className="space-y-2">
        <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
          Color del estampado
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRINT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() =>
                onChange({
                  ...value,
                  color: value.color === c.value ? undefined : c.value,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 border font-body text-xs transition-colors ${
                value.color === c.value
                  ? "border-crimson text-white bg-crimson/10"
                  : "border-white/10 text-white/40 hover:border-white/30"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(value.name || value.number || value.color) && (
        <div className="border-t border-white/5 pt-3">
          <p className="font-body text-[10px] tracking-widest uppercase text-white/30 mb-1">
            Vista previa
          </p>
          <p className="font-body text-xs text-white/60">
            {[value.name, value.number && `#${value.number}`, value.color && `Color: ${value.color}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
