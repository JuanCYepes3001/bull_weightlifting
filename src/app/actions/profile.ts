"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { updateProfileSchema, addAddressSchema } from "@/lib/validations/profile";
import type { Address } from "@/types";
import type { Json } from "@/types/database";

type ActionResult = { error?: string; success?: boolean };

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult> {
  const { user } = await requireAuth();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name, phone: parsed.data.phone ?? null })
    .eq("user_id", user.id);

  if (error) return { error: "Error al actualizar el perfil. Intenta de nuevo." };

  revalidatePath("/profile/account");
  return { success: true };
}

export async function addAddressAction(
  formData: FormData
): Promise<ActionResult> {
  const { user } = await requireAuth();

  const parsed = addAddressSchema.safeParse({
    label: formData.get("label"),
    street: formData.get("street"),
    city: formData.get("city"),
    department: formData.get("department"),
    zip_code: formData.get("zip_code") || undefined,
    is_default:
      formData.get("is_default") === "true" ||
      formData.get("is_default") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("addresses")
    .eq("user_id", user.id)
    .single();

  const existing: Address[] = (profileRow?.addresses as unknown as Address[]) ?? [];

  const updated = parsed.data.is_default
    ? existing.map((a) => ({ ...a, is_default: false }))
    : [...existing];

  const newAddress: Address = {
    id: crypto.randomUUID(),
    label: parsed.data.label,
    street: parsed.data.street,
    city: parsed.data.city,
    department: parsed.data.department,
    zip_code: parsed.data.zip_code,
    is_default: parsed.data.is_default ?? false,
  };

  updated.push(newAddress);

  const { error } = await supabase
    .from("profiles")
    .update({ addresses: updated as unknown as Json })
    .eq("user_id", user.id);

  if (error) return { error: "Error al guardar la dirección." };

  revalidatePath("/profile/account");
  return { success: true };
}

export async function deleteAddressAction(
  addressId: string
): Promise<ActionResult> {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("addresses")
    .eq("user_id", user.id)
    .single();

  const existing: Address[] = (profileRow?.addresses as unknown as Address[]) ?? [];
  const updated = existing.filter((a) => a.id !== addressId);

  const { error } = await supabase
    .from("profiles")
    .update({ addresses: updated as unknown as Json })
    .eq("user_id", user.id);

  if (error) return { error: "Error al eliminar la dirección." };

  revalidatePath("/profile/account");
  return { success: true };
}
