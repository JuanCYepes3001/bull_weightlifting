"use client";

import { useState } from "react";
import type { DailyStat } from "@/lib/queries/admin";

interface SalesChartProps {
  data7:  DailyStat[];
  data30: DailyStat[];
}

type Period = 7 | 30;
type Metric = "revenue" | "orders";

const COP = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

function SparkLine({
  data,
  metric,
  color,
}: {
  data: DailyStat[];
  metric: Metric;
  color: string;
}) {
  if (data.length === 0) return null;

  const W = 600;
  const H = 80;
  const PAD = 4;

  const values = data.map((d) => d[metric]);
  const max = Math.max(...values, 1);
  const min = 0;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1 || 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    return [x, y] as [number, number];
  });

  // Build area path
  const lineParts = pts.map(([x, y], i) =>
    i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  );
  const areaPath =
    lineParts.join(" ") +
    ` L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const linePath = lineParts.join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-20"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${metric})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({
  data,
  metric,
  color,
}: {
  data: DailyStat[];
  metric: Metric;
  color: string;
}) {
  const values = data.map((d) => d[metric]);
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px] h-20 w-full">
      {data.map((d, i) => {
        const pct = (d[metric] / max) * 100;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.7 }}
            />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-[#1a1a1a] border border-white/10 px-2 py-1 text-[9px] font-body text-white/80 whitespace-nowrap">
                {metric === "revenue" ? COP(d[metric]) : d[metric]}
              </div>
              <div className="text-[8px] font-body text-white/30 mt-0.5">
                {d.date.slice(5)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SalesChart({ data7, data30 }: SalesChartProps) {
  const [period, setPeriod] = useState<Period>(7);
  const [metric, setMetric] = useState<Metric>("revenue");

  const data = period === 7 ? data7 : data30;
  const values = data.map((d) => d[metric]);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = data.length ? total / data.length : 0;
  const max = Math.max(...values, 0);

  const color = metric === "revenue" ? "#DC2626" : "#60A5FA";

  return (
    <div className="border border-white/5 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Tendencia de ventas
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric toggle */}
          <div className="flex border border-white/10">
            {(["revenue", "orders"] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1 font-body text-[9px] tracking-widest uppercase transition-colors ${
                  metric === m
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {m === "revenue" ? "Ingresos" : "Órdenes"}
              </button>
            ))}
          </div>

          {/* Period toggle */}
          <div className="flex border border-white/10">
            {([7, 30] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 font-body text-[9px] tracking-widest uppercase transition-colors ${
                  period === p
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
        <div>
          <p className="font-body text-[9px] tracking-widest uppercase text-white/25 mb-1">Total</p>
          <p className="font-bebas text-xl tracking-wider" style={{ color }}>
            {metric === "revenue" ? COP(total) : total}
          </p>
        </div>
        <div>
          <p className="font-body text-[9px] tracking-widest uppercase text-white/25 mb-1">Promedio/día</p>
          <p className="font-bebas text-xl tracking-wider text-white/60">
            {metric === "revenue" ? COP(avg) : avg.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="font-body text-[9px] tracking-widest uppercase text-white/25 mb-1">Mejor día</p>
          <p className="font-bebas text-xl tracking-wider text-white/60">
            {metric === "revenue" ? COP(max) : max}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {period === 7 ? (
          <SparkLine data={data} metric={metric} color={color} />
        ) : (
          <BarChart data={data} metric={metric} color={color} />
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between">
        {(period === 7 ? data : [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]).map(
          (d) => (
            <span key={d.date} className="font-body text-[9px] text-white/20">
              {d.date.slice(5)}
            </span>
          )
        )}
      </div>
    </div>
  );
}
