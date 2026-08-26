import { z } from "zod";

export const acceptLegalSchema = z.object({
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debes aceptar los Términos y Condiciones para continuar",
    }),
  acceptPrivacy: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debes aceptar la Política de Privacidad para continuar",
    }),
});

export type AcceptLegalInput = z.infer<typeof acceptLegalSchema>;
