"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";
import { updateProfileAction } from "@/app/actions/profile";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
  name: string | null;
  phone: string | null;
  email: string;
}

export function ProfileForm({ name, phone, email }: ProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: name ?? "", phone: phone ?? "" },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setServerError(null);
    setSaved(false);
    const fd = new FormData();
    fd.append("name", data.name);
    if (data.phone) fd.append("phone", data.phone);
    const result = await updateProfileAction(fd);
    if (result.error) setServerError(result.error);
    else setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {serverError && (
        <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
          {serverError}
        </div>
      )}
      {saved && (
        <div className="border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400 font-body">
          Cambios guardados correctamente.
        </div>
      )}

      {/* Email — solo lectura */}
      <div className="space-y-1.5">
        <label className="font-body text-xs tracking-widest uppercase text-white/40">Email</label>
        <p className="font-body text-sm text-white/30 bg-white/[0.03] border border-white/5 px-3 py-2">
          {email}
        </p>
      </div>

      <Input
        label="Nombre completo"
        placeholder="Tu nombre"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Teléfono"
        type="tel"
        placeholder="+57 300 0000000"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Button type="submit" loading={isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
