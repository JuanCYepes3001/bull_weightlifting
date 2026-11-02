// Normaliza un número de WhatsApp a formato E.164 ("+573001234567").
// Acepta celulares colombianos sin indicativo (10 dígitos, empiezan por 3),
// con indicativo 57, o cualquier número internacional escrito con "+".
// Devuelve null si no es un número válido. Se usa en cliente y servidor.
export function normalizeWhatsAppNumber(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10 && digits.startsWith("3")) return `+57${digits}`;
  if (digits.length === 12 && digits.startsWith("573")) return `+${digits}`;
  return null;
}
