"use client";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface Props {
  searchParams: Promise<{ redirect?: string; registered?: string }>;
}

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthPending, startOAuthTransition] = useTransition();

  const handleGoogleLogin = () => {
    startOAuthTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (params.redirect) formData.append("redirect", params.redirect);

    const result = await loginAction(formData);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Registro exitoso */}
      {params.registered && (
        <div className="border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-white/80 font-body">
          Cuenta creada. Inicia sesión para continuar.
        </div>
      )}

      {/* Error del servidor */}
      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[38px] text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="font-body text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Entrar
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-body text-[10px] tracking-widest uppercase text-white/20">o</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={oauthPending}
        className="w-full flex items-center justify-center gap-3 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-body text-sm py-3 transition-all disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {oauthPending ? "Redirigiendo…" : "Continuar con Google"}
      </button>

      <div className="pt-2 flex flex-col gap-3 text-center text-sm font-body">
        <span className="text-white/40">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-white hover:text-crimson transition-colors underline underline-offset-4"
          >
            Regístrate
          </Link>
        </span>
      </div>
    </form>
  );
}
