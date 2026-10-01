"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptLegalAction } from "@/app/actions/legal";
import { acceptLegalSchema, type AcceptLegalInput } from "@/lib/validations/legal";
import { LegalModal } from "@/components/legal/LegalModal";
import { Button } from "@/components/ui/Button";

interface AcceptLegalFormProps {
  next: string;
}

export function AcceptLegalForm({ next }: AcceptLegalFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AcceptLegalInput>({
    resolver: zodResolver(acceptLegalSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const acceptTerms = watch("acceptTerms");
  const acceptPrivacy = watch("acceptPrivacy");
  const canSubmit = acceptTerms && acceptPrivacy;

  const onSubmit = async (data: AcceptLegalInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("acceptTerms", String(data.acceptTerms));
    formData.append("acceptPrivacy", String(data.acceptPrivacy));
    formData.append("next", next);

    const result = await acceptLegalAction(formData);
    if (result?.error) setServerError(result.error);
    // Sin error = acceptLegalAction hizo redirect() internamente
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      <div className="space-y-3">
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
        Continuar
      </Button>
    </form>
  );
}
