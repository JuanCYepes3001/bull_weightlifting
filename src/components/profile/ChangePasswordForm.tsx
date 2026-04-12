"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("currentPassword", currentPassword);
      fd.append("newPassword", newPassword);
      fd.append("confirmPassword", confirmPassword);
      const result = await changePasswordAction(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {error && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {error}
        </div>
      )}
      {saved && (
        <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 font-body flex items-center gap-2">
          <Check size={14} /> Contraseña actualizada
        </div>
      )}

      <div className="relative">
        <Input
          label="Contraseña actual"
          type={showPw ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
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
        label="Nueva contraseña"
        type={showPw ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Input
        label="Confirmar nueva contraseña"
        type={showPw ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Button type="submit" size="sm" loading={pending}>
        Actualizar contraseña
      </Button>
    </form>
  );
}
