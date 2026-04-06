"use client";

import { use, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  searchParams: Promise<{ redirect?: string; registered?: string }>;
}

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Entrar
      </Button>

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
