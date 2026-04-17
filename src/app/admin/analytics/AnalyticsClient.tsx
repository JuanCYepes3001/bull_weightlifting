"use client";

import { useState } from "react";
import type { DailyStat, WeeklyStat, MonthlyStat } from "@/lib/queries/admin";

type View = "daily" | "weekly" | "monthly";
type Metric = "revenue" | "orders";

interface Props {
  daily:   DailyStat[];
  weekly:  WeeklyStat[];
  monthly: MonthlyStat[];
}

const COP = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${Math.round(n)}`;

/* ── SVG bar chart ─────────────────────────────────────── */
function BarChart({
  values,
  labels,
  color,
  metric,
}: {
  values: number[];
  labels: string[];
  color: string;
  metric: Metric;
}) {
  const [tooltip, setTooltip] = useState<{ i: number } | null>(null);
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[3px] h-48 w-full">
        {values.map((v, i) => {
          const pct = (v / max) * 100;
          const isHovered = tooltip?.i === i;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full relative group"
              onMouseEnter={() => setTooltip({ i })}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-[#1a1a1a] border border-white/15 px-2.5 py-1.5 text-center whitespace-nowrap">
                    <p className="font-bebas text-sm tracking-wider" style={{ color }}>
                      {metric === "revenue" ? COP(v) : v}
                    </p>
                    <p className="font-body text-[9px] text-white/30 mt-0.5">{labels[i]}</p>
                  </div>
                  <div
                    className="w-2 h-2 mx-auto -mt-1 rotate-45 border-r border-b border-white/15 bg-[#1a1a1a]"
                  />
                </div>
              )}
              <div
                className="w-full transition-all duration-200 cursor-pointer"
                style={{
                  height: `${Math.max(pct, 1.5)}%`,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.65,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X labels — show a subset to avoid crowding */}
      <div className="flex justify-between px-0.5">
        {labels
          .filter((_, i) => {
            const step = Math.max(1, Math.floor(labels.length / 8));
            return i % step === 0 || i === labels.length - 1;
          })
          .map((l, idx) => (
            <span key={idx} className="font-body text-[9px] text-white/20 truncate max-w-[40px]">
              {l}
            </span>
          ))}
      </div>
    </div>
  );
}

/* ── Summary KPI cards ─────────────────────────────────── */
function KPICard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border border-white/5 bg-white/[0.02] p-5 space-y-2">
      <p className="font-body text-[9px] tracking-widest uppercase text-white/30">{label}</p>
      <p className="font-bebas text-2xl tracking-wider" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

/* ── Main client component ─────────────────────────────── */
export function AnalyticsClient({ daily, weekly, monthly }: Props) {
  const [view, setView] = useState<View>("daily");
  const [metric, setMetric] = useState<Metric>("revenue");

  const activeColor = metric === "revenue" ? "#DC2626" : "#60A5FA";

  // Resolve active dataset
  const { values, labels, total, avg, max, best } = (() => {
    const rows =
      view === "daily"
        ? daily.map((d) => ({ v: d[metric], lbl: d.date.slice(5) }))
        : view === "weekly"
        ? weekly.map((d) => ({ v: d[metric], lbl: d.label }))
        : monthly.map((d) => ({ v: d[metric], lbl: d.label }));

    const vals = rows.map((r) => r.v);
    const lbls = rows.map((r) => r.lbl);
    const tot  = vals.reduce((a, b) => a + b, 0);
    const mx   = Math.max(...vals, 0);
    const bestIdx = vals.indexOf(mx);
    return {
      values: vals,
      labels: lbls,
      total:  tot,
      avg:    rows.length ? tot / rows.length : 0,
      max:    mx,
      best:   rows[bestIdx]?.lbl ?? "—",
    };
  })();

  const fmt = (n: number) =>
    metric === "revenue" ? COP(n) : n % 1 === 0 ? String(n) : n.toFixed(1);

  const viewLabels: Record<View, string> = {
    daily:   "Últimos 30 días",
    weekly:  "Últimas 12 semanas",
    monthly: "Últimos 12 meses",
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-body text-[9px] tracking-widest uppercase text-white/30">
            {viewLabels[view]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric toggle */}
          <div className="flex border border-white/10">
            {(["revenue", "orders"] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 font-body text-[9px] tracking-widest uppercase transition-colors ${
                  metric === m ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {m === "revenue" ? "Ingresos" : "Órdenes"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex border border-white/10">
            {(["daily", "weekly", "monthly"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 font-body text-[9px] tracking-widest uppercase transition-colors ${
                  view === v ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {v === "daily" ? "Diario" : v === "weekly" ? "Semanal" : "Mensual"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total período"   value={fmt(total)}   color={activeColor} />
        <KPICard label="Promedio"        value={fmt(avg)}     color="#9CA3AF" />
        <KPICard label="Mejor período"   value={fmt(max)}     color="#34D399" />
        <KPICard label="Período récord"  value={best}         color="#F59E0B" />
      </div>

      {/* Chart */}
      <div className="border border-white/5 bg-white/[0.02] p-6">
        {values.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="font-body text-xs text-white/20">Sin datos en este período.</p>
          </div>
        ) : (
          <BarChart values={values} labels={labels} color={activeColor} metric={metric} />
        )}
      </div>

      {/* Data table */}
      <div className="border border-white/5">
        <div className="grid grid-cols-3 border-b border-white/5 px-4 py-2 bg-white/[0.02]">
          <span className="font-body text-[9px] tracking-widest uppercase text-white/30">Período</span>
          <span className="font-body text-[9px] tracking-widest uppercase text-white/30 text-right">Órdenes</span>
          <span className="font-body text-[9px] tracking-widest uppercase text-white/30 text-right">Ingresos</span>
        </div>
        <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
          {(view === "daily" ? [...daily].reverse()
            : view === "weekly" ? [...weekly].reverse()
            : [...monthly].reverse()
          ).map((row) => {
            const label =
              "date" in row ? row.date
              : "week" in row ? (row as WeeklyStat).label
              : (row as MonthlyStat).label;
            return (
              <div key={label} className="grid grid-cols-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <span className="font-body text-xs text-white/50">{label}</span>
                <span className="font-body text-xs text-white/60 text-right">{row.orders}</span>
                <span className="font-body text-xs text-white/60 text-right">{COP(row.revenue)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
