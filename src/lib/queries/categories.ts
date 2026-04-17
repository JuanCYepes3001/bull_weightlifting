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

