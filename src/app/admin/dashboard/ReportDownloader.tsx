"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type Format = "csv" | "excel";

export default function ReportDownloader() {
  const now = new Date();
  const [type,    setType]    = useState<"monthly" | "annual">("monthly");
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [loading, setLoading] = useState<Format | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDownload = async (format: Format) => {
    setLoading(format);
    setError(null);
    try {
      const params = new URLSearchParams({ format, type, year: String(year) });
      if (type === "monthly") params.set("month", String(month));

      const res = await fetch(`/api/admin/reports/orders?${params}`);
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");

      const periodStr =
        type === "annual"
          ? String(year)
          : `${year}-${String(month).padStart(2, "0")}`;

      a.href     = url;
      a.download = `ordenes-${periodStr}.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al generar el informe. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  };

  const periodLabel =
    type === "annual"
      ? String(year)
      : `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="border border-white/5 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText size={12} className="text-white/30" />
        <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
          Descargar Informe de Órdenes
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Period type toggle */}
        <div className="space-y-1.5">
          <p className="font-body text-[9px] tracking-widest uppercase text-white/25">
            Período
          </p>
          <div className="flex gap-1">
            {(["monthly", "annual"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`font-body text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors ${
                  type === t
                    ? "border-crimson/40 bg-crimson/10 text-crimson"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                {t === "monthly" ? "Mensual" : "Anual"}
              </button>
            ))}
          </div>
        </div>

        {/* Month selector */}
        {type === "monthly" && (
          <div className="space-y-1.5">
            <p className="font-body text-[9px] tracking-widest uppercase text-white/25">
              Mes
            </p>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1} className="bg-[#1a1a1a]">
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year selector */}
        <div className="space-y-1.5">
          <p className="font-body text-[9px] tracking-widest uppercase text-white/25">
            Año
          </p>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#1a1a1a]">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Download buttons */}
        <div className="flex gap-2 self-end">
          <button
            type="button"
            onClick={() => handleDownload("csv")}
            disabled={loading !== null}
            className="flex items-center gap-2 font-body text-xs tracking-widest uppercase px-4 py-2 border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40"
            title="Descargar CSV"
          >
            <Download size={12} />
            {loading === "csv" ? "Generando…" : "CSV"}
          </button>

          <button
            type="button"
            onClick={() => handleDownload("excel")}
            disabled={loading !== null}
            className="flex items-center gap-2 font-body text-xs tracking-widest uppercase px-4 py-2 bg-crimson hover:bg-crimson-light text-white transition-colors disabled:opacity-50"
            title="Descargar Excel"
          >
            <FileSpreadsheet size={12} />
            {loading === "excel" ? "Generando…" : "Excel"}
          </button>
        </div>
      </div>

      {/* Info / error */}
      {error ? (
        <p className="font-body text-xs text-red-400">{error}</p>
      ) : (
        <p className="font-body text-[9px] text-white/20">
          Período:{" "}
          <span className="text-white/40">{periodLabel}</span>
          {" · "}ID · Cliente · Productos · Total COP · Estado · Fecha
        </p>
      )}
    </div>
  );
}
