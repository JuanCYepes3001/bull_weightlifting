"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { AddressForm, EMPTY_ADDRESS, type AddressValue } from "@/components/ui/AddressForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [addrValue, setAddrValue]       = useState<AddressValue>(EMPTY_ADDRESS);

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
    if (score <= 1) return { label: "Débil",   color: "bg-red-500",    width: "w-1/4" };
    if (score === 2) return { label: "Regular", color: "bg-yellow-500", width: "w-2/4" };
    if (score === 3) return { label: "Buena",   color: "bg-blue-500",   width: "w-3/4" };
    return               { label: "Fuerte",  color: "bg-crimson",    width: "w-full" };
  })();

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    // Validate address fields
    if (!addrValue.country || !addrValue.state || !addrValue.city || !addrValue.address.trim()) {
      setServerError("Por favor completa todos los campos de dirección de envío");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));

    // Append address fields
    formData.append("country",  addrValue.country);
    formData.append("state",    addrValue.state);
    formData.append("city",     addrValue.city);
    formData.append("address",  addrValue.address);
    formData.append("zip_code", addrValue.zip_code);

    const result = await registerAction(formData);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.verificationSent) {
      setVerificationSent(true);
    }
    // No error and no verificationSent = registerAction called redirect() internally
  };

  if (verificationSent) {
    return (
      <div className="border border-crimson/40 bg-crimson/10 px-6 py-10 text-center space-y-4">
        <p className="font-heading text-lg tracking-widest text-crimson uppercase">¡Cuenta creada!</p>
        <p className="font-body text-sm text-white/70 leading-relaxed">
          Te enviamos un correo de verificación. Revisa tu bandeja de entrada (y la carpeta de
          spam) y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 font-body text-sm text-white hover:text-crimson transition-colors underline underline-offset-4"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          type="text"
          placeholder="Juan"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Apellido"
          type="text"
          placeholder="García"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Contraseña */}
      <div className="space-y-2">
        <label className="text-xs font-heading tracking-widest uppercase text-white/60">
          Contraseña
        </label>
        <div className="relative">
          <Input
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
            className="absolute right-3 top-0 h-11 flex items-center z-10 text-white/30 hover:text-white/60 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

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

      {/* Dirección de envío */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <MapPin size={13} className="text-crimson" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
            Dirección de envío
          </span>
        </div>
        <AddressForm value={addrValue} onChange={setAddrValue} />
      </div>

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
