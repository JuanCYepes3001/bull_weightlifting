import { createClient } from "@/lib/supabase/server";
import type { Category, Gender } from "@/types";

export async function getCategories(gender?: Gender): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (gender) query = query.eq("gender", gender);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Category;
}
