import { createClient } from "@/lib/supabase/server";
import { BrandStatementCarousel } from "./BrandStatementCarousel";

export async function BrandStatement() {
  const supabase = await createClient();

  const { data: files } = await supabase.storage.from("athletes").list("", {
    limit: 20,
    sortBy: { column: "name", order: "asc" },
  });

  const imageUrls = (files ?? [])
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f.name))
    .map((f) => supabase.storage.from("athletes").getPublicUrl(f.name).data.publicUrl);

  return <BrandStatementCarousel imageUrls={imageUrls} />;
}
