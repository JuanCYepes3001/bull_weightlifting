"use client";

import { useState } from "react";
import type { CartCustomization } from "@/store/cartStore";
import { Ruler } from "lucide-react";

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

const DESIGNS = [
  { label: "Clásico",      value: "clasico",     desc: "Nombre y número con tipografía estándar" },
  { label: "Bull",         value: "bull",        desc: "Incluye el logo Bull en pecho y espalda" },
  { label: "Minimalista",  value: "minimalista", desc: "Texto pequeño, sin elementos extra" },
];

export function TrusasCustomizer({ value, onChange }: TrusasCustomizerProps) {
  const [showMedidas, setShowMedidas] = useState(
    !!(value.chest || value.hip || value.torso)
  );

  const set = (key: keyof CartCustomization, val: string | undefined) =>
    onChange({ ...value, [key]: val || undefined });

  return (
    <div className="border border-crimson/20 bg-crimson/5 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
        <p className="font-impact text-[10px] tracking-[0.4em] text-crimson uppercase">
          Personalización
        </p>
      </div>

      <p className="font-body text-xs text-white/40 leading-relaxed -mt-2">
        Todos los campos son opcionales.
      </p>

      {/* Nombre + Número */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
            Nombre
          </label>
          <input
            type="text"
            maxLength={16}
            placeholder="Ej. García"
            value={value.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-crimson/50 outline-none px-3 py-2 font-body text-sm text-white placeholder:text-white/20 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
            Número
          </label>
          <input
            type="text"
            maxLength={3}
            placeholder="Ej. 10"
            value={value.number ?? ""}
            onChange={(e) => set("number", e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full bg-white/5 border border-white/10 focus:border-crimson/50 outline-none px-3 py-2 font-body text-sm text-white placeholder:text-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Diseño */}
      <div className="space-y-2">
        <label className="font-body text-[10px] tracking-widest uppercase text-white/40">
          Diseño del estampado
        </label>
        <div className="flex flex-col gap-1.5">
          {DESIGNS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set("design", value.design === d.value ? undefined : d.value)}
              className={`flex items-start gap-3 px-3 py-2 border text-left transition-colors ${
                value.design === d.value
                  ? "border-crimson bg-crimson/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full border mt-0.5 flex-shrink-0 ${
                  value.design === d.value ? "border-crimson bg-crimson" : "border-white/30"
                }`}
              />
              <span>
                <span className="font-body text-xs text-white block">{d.label}</span>
                <span className="font-body text-[10px] text-white/30">{d.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color del estampado */}
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
                set("printColor", value.printColor === c.value ? undefined : c.value)
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 border font-body text-xs transition-colors ${
                value.printColor === c.value
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

      {/* Medidas personalizadas (toggle) */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <button
          type="button"
          onClick={() => {
            setShowMedidas((v) => !v);
            if (showMedidas) {
              onChange({ ...value, chest: undefined, hip: undefined, torso: undefined });
            }
          }}
          className="flex items-center gap-2 group"
        >
          <Ruler size={13} className="text-white/30 group-hover:text-white/60 transition-colors" />
          <span className="font-body text-[10px] tracking-widest uppercase text-white/40 group-hover:text-white/60 transition-colors">
            {showMedidas ? "Ocultar medidas personalizadas" : "Agregar medidas personalizadas"}
          </span>
        </button>

        {showMedidas && (
          <div className="space-y-3 pl-5">
            <p className="font-body text-[10px] text-white/25 leading-relaxed">
              Si tu talla estándar no te queda perfecta, indícanos tus medidas en centímetros.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "chest", label: "Pecho (cm)",  placeholder: "Ej. 95" },
                  { key: "hip",   label: "Cadera (cm)", placeholder: "Ej. 88" },
                  { key: "torso", label: "Largo (cm)",  placeholder: "Ej. 72" },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="font-body text-[9px] tracking-widest uppercase text-white/30">
                    {label}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={placeholder}
                    value={value[key] ?? ""}
                    onChange={(e) => set(key, e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-white/5 border border-white/10 focus:border-crimson/50 outline-none px-2 py-1.5 font-body text-xs text-white placeholder:text-white/20 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vista previa */}
      {(value.name || value.number || value.printColor || value.design || value.chest) && (
        <div className="border-t border-white/5 pt-3">
          <p className="font-body text-[10px] tracking-widest uppercase text-white/25 mb-1">
            Vista previa
          </p>
          <p className="font-body text-xs text-white/50 leading-relaxed">
            {[
              value.name && `Nombre: ${value.name}`,
              value.number && `#${value.number}`,
              value.design && `Diseño: ${DESIGNS.find((d) => d.value === value.design)?.label}`,
              value.printColor && `Color: ${PRINT_COLORS.find((c) => c.value === value.printColor)?.label}`,
              (value.chest || value.hip || value.torso) &&
                `Medidas: ${[value.chest && `P${value.chest}`, value.hip && `C${value.hip}`, value.torso && `L${value.torso}`].filter(Boolean).join(" / ")} cm`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
