"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addAddressAction } from "@/app/actions/profile";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/* Schema local sin el optional en is_default para react-hook-form */
const formSchema = z.object({
  label:      z.string().min(1, "La etiqueta es requerida"),
  street:     z.string().min(5, "Ingresa una dirección válida"),
  city:       z.string().min(2, "La ciudad es requerida"),
  department: z.string().min(2, "El departamento es requerido"),
  zip_code:   z.string().optional(),
  is_default: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddressForm() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { is_default: false },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const fd = new FormData();
    fd.append("label", data.label);
    fd.append("street", data.street);
    fd.append("city", data.city);
    fd.append("department", data.department);
    if (data.zip_code) fd.append("zip_code", data.zip_code);
    fd.append("is_default", data.is_default ? "true" : "false");

    const result = await addAddressAction(fd);
    if (result.error) setServerError(result.error);
    else { reset(); setOpen(false); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-dashed border-white/10 hover:border-crimson/50 text-white/30 hover:text-white/60 font-body text-xs tracking-widest uppercase px-6 py-4 w-full transition-colors text-left"
      >
        + Agregar dirección
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-sm text-white tracking-wider">NUEVA DIRECCIÓN</h3>
        <button
          type="button"
          onClick={() => { setOpen(false); reset(); }}
          className="font-body text-xs text-white/30 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>

      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Etiqueta (ej. Casa)" placeholder="Casa" error={errors.label?.message} {...register("label")} />
        <Input label="Dirección" placeholder="Calle 123 #45-67" error={errors.street?.message} {...register("street")} />
        <Input label="Ciudad" placeholder="Bogotá" error={errors.city?.message} {...register("city")} />
        <Input label="Departamento" placeholder="Cundinamarca" error={errors.department?.message} {...register("department")} />
        <Input label="Código postal (opcional)" placeholder="110111" error={errors.zip_code?.message} {...register("zip_code")} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register("is_default")} className="accent-crimson" />
        <span className="font-body text-xs text-white/50">Establecer como dirección principal</span>
      </label>

      <Button type="submit" loading={isSubmitting}>
        Guardar dirección
      </Button>
    </form>
  );
}
