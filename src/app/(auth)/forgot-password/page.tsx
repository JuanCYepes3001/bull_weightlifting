"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("email", email);
      const result = await requestPasswordResetAction(fd);
      if (result.error) setError(result.error);
      else setSent(true);
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors mb-4"
        >
          <ArrowLeft size={11} /> Volver
        </Link>
        <h1 className="font-heading text-4xl text-white tracking-wider">
          Recuperar acceso
        </h1>
        <p className="text-white/40 font-body text-sm">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {sent ? (
        <div className="border border-green-500/30 bg-green-500/10 px-5 py-6 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Mail size={16} />
            <p className="font-body text-sm font-semibold">Correo enviado</p>
          </div>
          <p className="font-body text-sm text-white/60">
            Si existe una cuenta con ese email, recibirás un enlace de recuperación en los próximos minutos. Revisa también tu carpeta de spam.
          </p>
          <Link
            href="/login"
            className="inline-block font-body text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors mt-2"
          >
            Volver al inicio de sesión →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Enviar enlace de recuperación
          </Button>
        </form>
      )}
    </div>
  );
}
