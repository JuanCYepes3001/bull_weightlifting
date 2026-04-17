"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("confirmPassword", confirmPassword);
      const result = await resetPasswordAction(fd);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-white tracking-wider">
          Nueva contraseña
        </h1>
        <p className="text-white/40 font-body text-sm">
          Elige una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
            {error}
          </div>
        )}

        <div className="relative">
          <Input
            label="Nueva contraseña"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-[38px] text-white/30 hover:text-white/60 transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Input
          label="Confirmar contraseña"
          type={showPw ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Guardar nueva contraseña
        </Button>
      </form>
    </div>
  );
}
