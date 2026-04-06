import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
});

export const addAddressSchema = z.object({
  label: z.string().min(1, "La etiqueta es requerida"),
  street: z.string().min(5, "Ingresa una dirección válida"),
  city: z.string().min(2, "La ciudad es requerida"),
  department: z.string().min(2, "El departamento es requerido"),
  zip_code: z.string().optional(),
  is_default: z.boolean().optional().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
