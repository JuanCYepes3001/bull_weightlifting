"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/app/actions/orders";

const STATUSES = [
  { key: "pending",    label: "Pendiente" },
  { key: "processing", label: "En proceso" },
  { key: "shipped",    label: "Enviada" },
  { key: "delivered",  label: "Entregada" },
  { key: "cancelled",  label: "Cancelada" },
  { key: "refunded",   label: "Reembolsada" },
];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (selected === currentStatus) return;
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, selected);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          router.refresh();
        }, 1000);
      }
    });
  };

  const changed = selected !== currentStatus;

  return (
    <div className="border border-white/5 p-5 space-y-3">
      <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/25">
        Actualizar estado
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={pending}
          className="bg-white/5 border border-white/10 px-3 py-2 font-body text-sm text-white focus:outline-none focus:border-crimson/60 disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key} className="bg-[#1a1a1a]">
              {s.label}
            </option>
          ))}
        </select>

        {changed && (
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="font-body text-xs tracking-widest uppercase px-4 py-2 bg-crimson hover:bg-crimson-light text-white transition-colors disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Confirmar"}
          </button>
        )}

        {saved && (
          <span className="font-body text-xs text-green-400">
            ✓ Estado actualizado
          </span>
        )}
        {error && (
          <span className="font-body text-xs text-red-400">{error}</span>
        )}
      </div>
    </div>
  );
}
