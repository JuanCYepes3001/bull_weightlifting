// La Trusa Clásica Personalizada se vende a precio fijo como un ítem normal;
// la personalización (nombre, número, diseño, color del estampado) se acuerda
// por WhatsApp después del pago. Es el único producto que la requiere.
export const CUSTOMIZABLE_PRODUCT_SLUG = "trusaclasicapersonalizada";

export function isCustomizableProduct(slug: string | null | undefined): boolean {
  return slug === CUSTOMIZABLE_PRODUCT_SLUG;
}
