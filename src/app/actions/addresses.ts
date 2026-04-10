"use server";

import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types";

export async function getUserAddressesAction(): Promise<Address[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("addresses")
    .eq("user_id", user.id)
    .single();

  return (profile?.addresses as unknown as Address[]) ?? [];
}
