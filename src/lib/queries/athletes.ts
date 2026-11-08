import { createAdminClient } from "@/lib/supabase/admin";

// Fotos de deportistas del bucket `athletes`: subir una imagen ahí basta para
// que aparezca en el hero y en el carrusel de la home.
export async function getAthleteImageUrls(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data: files } = await supabase.storage.from("athletes").list("", {
    limit: 30,
    sortBy: { column: "name", order: "asc" },
  });

  return (files ?? [])
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f.name))
    .map((f) => supabase.storage.from("athletes").getPublicUrl(f.name).data.publicUrl);
}
