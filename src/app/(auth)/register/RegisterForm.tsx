"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const passwordStrength = (() => {
    if (!password) return null;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: "Débil", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Regular", color: "bg-yellow-500", width: "w-2/4" };
    if (score === 3) return { label: "Buena", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Fuerte", color: "bg-crimson", width: "w-full" };
  })();

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));

    const result = await registerAction(formData);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      <Input
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
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

        {/* Indicador de fortaleza */}
        {passwordStrength && (
          <div className="space-y-1">
            <div className="h-0.5 bg-white/10 w-full">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
              />
            </div>
            <p className="text-xs text-white/30 font-body">
              Fortaleza: {passwordStrength.label}
            </p>
          </div>
        )}
      </div>

      <Input
        label="Confirmar contraseña"
        type={showPassword ? "text" : "password"}
        placeholder="Repite tu contraseña"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Crear cuenta
      </Button>

      <div className="pt-2 text-center text-sm font-body">
        <span className="text-white/40">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-white hover:text-crimson transition-colors underline underline-offset-4"
          >
            Inicia sesión
          </Link>
        </span>
      </div>
    </form>
  );
}
