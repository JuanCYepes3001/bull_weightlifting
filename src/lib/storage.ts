const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const EXTENSIONS = ["jpeg", "jpg", "png", "webp"];

export function getProductImageUrl(productName: string, color: string, ext = "jpeg"): string {
  const filename = `${productName} ${color}.${ext}`;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${encodeURIComponent(filename)}`;
}

export function getProductImageCandidates(productName: string, color: string): string[] {
  return EXTENSIONS.map((ext) => getProductImageUrl(productName, color, ext));
}
