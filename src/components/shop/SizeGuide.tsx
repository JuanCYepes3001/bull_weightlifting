"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";

const TOPS = [
  { size: "XS",  chest: "86–90",  waist: "70–74",  hip: "90–94"  },
  { size: "S",   chest: "90–94",  waist: "74–78",  hip: "94–98"  },
  { size: "M",   chest: "94–98",  waist: "78–82",  hip: "98–102" },
  { size: "L",   chest: "98–103", waist: "82–87",  hip: "102–107"},
  { size: "XL",  chest: "103–110",waist: "87–94",  hip: "107–114"},
  { size: "XXL", chest: "110–118",waist: "94–102", hip: "114–122"},
];

const BOTTOMS = [
  { size: "XS",  waist: "66–70", hip: "86–90",  inseam: "73" },
  { size: "S",   waist: "70–74", hip: "90–94",  inseam: "74" },
  { size: "M",   waist: "74–78", hip: "94–98",  inseam: "75" },
  { size: "L",   waist: "78–83", hip: "98–103", inseam: "76" },
  { size: "XL",  waist: "83–90", hip: "103–110",inseam: "77" },
  { size: "XXL", waist: "90–98", hip: "110–118",inseam: "78" },
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState<"tops" | "bottoms">("tops");

  return (
    <div className="border border-white/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
          <Ruler size={12} />
          Guía de tallas
        </span>
        <span className="font-body text-xs text-white/25">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 pb-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-0 border border-white/10 mt-4 w-fit">
            {(["tops", "bottoms"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 font-body text-[10px] tracking-widest uppercase transition-colors ${
                  tab === t ? "bg-crimson text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {t === "tops" ? "Superiores" : "Inferiores"}
              </button>
            ))}
          </div>

          <p className="font-body text-[10px] text-white/25">
            Medidas en centímetros (cm). Mide directamente sobre tu cuerpo.
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {tab === "tops" ? (
                    <>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Talla</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Pecho</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Cintura</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30">Cadera</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Talla</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Cintura</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30 pr-6">Cadera</th>
                      <th className="pb-2 font-body text-[9px] tracking-[0.2em] uppercase text-white/30">Tiro</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {tab === "tops"
                  ? TOPS.map((row) => (
                      <tr key={row.size} className="border-b border-white/[0.03]">
                        <td className="py-2 font-bebas text-base tracking-wider text-white pr-6">{row.size}</td>
                        <td className="py-2 font-body text-xs text-white/50 pr-6">{row.chest}</td>
                        <td className="py-2 font-body text-xs text-white/50 pr-6">{row.waist}</td>
                        <td className="py-2 font-body text-xs text-white/50">{row.hip}</td>
                      </tr>
                    ))
                  : BOTTOMS.map((row) => (
                      <tr key={row.size} className="border-b border-white/[0.03]">
                        <td className="py-2 font-bebas text-base tracking-wider text-white pr-6">{row.size}</td>
                        <td className="py-2 font-body text-xs text-white/50 pr-6">{row.waist}</td>
                        <td className="py-2 font-body text-xs text-white/50 pr-6">{row.hip}</td>
                        <td className="py-2 font-body text-xs text-white/50">{row.inseam}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
