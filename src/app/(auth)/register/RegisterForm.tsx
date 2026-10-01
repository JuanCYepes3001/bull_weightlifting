"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { AddressForm, EMPTY_ADDRESS, type AddressValue } from "@/components/ui/AddressForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LegalModal } from "@/components/legal/LegalModal";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [addrValue, setAddrValue]       = useState<AddressValue>(EMPTY_ADDRESS);
  const [phone, setPhone]               = useState("");
  const [oauthPending, startOAuthTransition] = useTransition();

  const handleGoogleRegister = () => {
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const password = watch("password", "");
  const acceptTerms = watch("acceptTerms");
  const acceptPrivacy = watch("acceptPrivacy");
  const canSubmit = acceptTerms && acceptPrivacy;

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
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));

    // Append phone + address fields
    if (phone.trim()) formData.append("phone", phone.trim());
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
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={oauthPending}
        className="w-full flex items-center justify-center gap-3 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-body text-sm py-3 transition-all disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {oauthPending ? "Redirigiendo…" : "Registrarse con Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-body text-[10px] tracking-widest uppercase text-white/20">o con email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

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

      <Input
        label="Teléfono / WhatsApp"
        type="tel"
        placeholder="3001234567"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Contraseña */}
      <div className="space-y-2">
        <label className="text-xs font-heading tracking-widest uppercase text-white/60">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className={`h-11 w-full bg-white/5 border pl-4 pr-12 text-sm text-white placeholder:text-white/30 rounded-none transition-colors focus:outline-none focus:border-crimson focus:bg-white/8 ${errors.password ? "border-red-500/60" : "border-white/10"}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 inset-y-0 flex items-center z-10 text-white/30 hover:text-white/60 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 font-body">{errors.password.message}</p>
        )}

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

      {/* Aceptación legal */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-crimson bg-white/5 border border-white/20"
            {...register("acceptTerms")}
          />
          <span className="font-body text-xs text-white/60 leading-relaxed">
            He leído y acepto los{" "}
            <LegalModal
              slug="terminos"
              className="text-white underline underline-offset-4 hover:text-crimson transition-colors"
            >
              Términos y Condiciones
            </LegalModal>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-red-400 font-body">{errors.acceptTerms.message}</p>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-crimson bg-white/5 border border-white/20"
            {...register("acceptPrivacy")}
          />
          <span className="font-body text-xs text-white/60 leading-relaxed">
            He leído y acepto la{" "}
            <LegalModal
              slug="privacidad"
              className="text-white underline underline-offset-4 hover:text-crimson transition-colors"
            >
              Política de Privacidad
            </LegalModal>
          </span>
        </label>
        {errors.acceptPrivacy && (
          <p className="text-xs text-red-400 font-body">{errors.acceptPrivacy.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
        disabled={!canSubmit}
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
