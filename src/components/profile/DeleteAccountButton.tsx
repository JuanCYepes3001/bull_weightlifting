"use client";

import { useState } from "react";
import { deleteAccountAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const result = await deleteAccountAction();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setStep("idle");
    }
  };

  if (step === "idle") {
    return (
      <Button variant="danger" size="sm" onClick={() => setStep("confirm")}>
        Eliminar cuenta
      </Button>
    );
  }

  return (
    <div className="border border-red-500/30 bg-red-500/5 p-4 space-y-4">
      <p className="font-body text-sm text-white/70">
        ¿Estás seguro? Esta acción es <span className="text-red-400 font-semibold">irreversible</span>. Se eliminarán tu cuenta, perfil y datos personales de forma permanente.
      </p>
      {error && (
        <p className="font-body text-sm text-red-400">{error}</p>
      )}
      <div className="flex gap-3">
        <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
          Sí, eliminar mi cuenta
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setStep("idle")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
