"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(endAt: string): TimeLeft | null {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

export function SaleTimer({ saleEndAt }: { saleEndAt: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(saleEndAt));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(saleEndAt));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [saleEndAt]);

  if (!timeLeft) return null;

  const units = [
    { label: "días",    value: timeLeft.days },
    { label: "horas",   value: timeLeft.hours },
    { label: "min",     value: timeLeft.minutes },
    { label: "seg",     value: timeLeft.seconds },
  ];

  return (
    <div className="border border-crimson/30 bg-crimson/5 px-4 py-3">
      <p className="font-body text-[9px] tracking-[0.3em] uppercase text-crimson/70 mb-2">
        ⏱ Oferta termina en
      </p>
      <div className="flex items-end gap-3">
        {units.map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-bebas text-2xl tracking-wider text-crimson leading-none">
              {String(value).padStart(2, "0")}
            </p>
            <p className="font-body text-[8px] tracking-widest uppercase text-white/30 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
