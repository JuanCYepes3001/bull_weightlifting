// Las trusas personalizadas se venden a precio fijo como un ítem normal; la
// personalización (nombre, número, diseño, color del estampado) se acuerda por
// WhatsApp después del pago, al número indicado en el checkout.
export const CUSTOMIZABLE_PRODUCT_SLUGS: ReadonlySet<string> = new Set([
  "trusaclasicapersonalizada",
  "trusamangaspersonalizada",
  "trusaalbornozpersonalizada",
]);

export function isCustomizableProduct(slug: string | null | undefined): boolean {
  return !!slug && CUSTOMIZABLE_PRODUCT_SLUGS.has(slug);
}
