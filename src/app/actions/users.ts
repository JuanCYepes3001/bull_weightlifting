"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

type ActionResult = { error?: string; success?: boolean };

export async function updateUserRoleAction(
  profileId: string,
  role: "user" | "admin"
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: "Error al actualizar el rol" };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function createAdminUserAction(
  email: string,
  password: string,
  name: string
): Promise<ActionResult> {
  if (!email || !password || !name)
    return { error: "Todos los campos son requeridos" };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres" };

  await requireAdmin();
  const adminSupabase = createAdminClient();

  const { data: userData, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError) {
    if (createError.message.includes("already registered"))
      return { error: "Ya existe un usuario con ese correo" };
    console.error("[Users] createUser error:", createError.message);
    return { error: "Error al crear el usuario. Intenta de nuevo." };
  }

  // Profile may be created via trigger — update role and name
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: "admin", name })
    .eq("user_id", userData.user.id);

  revalidatePath("/admin/users");
  return { success: true };
}

export async function assignAdminRoleByEmailAction(
  email: string
): Promise<ActionResult> {
  if (!email) return { error: "Correo requerido" };
  await requireAdmin();

  const adminSupabase = createAdminClient();
  // perPage:1000 avoids the default 50-user pagination limit that would silently miss users
  const {
    data: { users },
    error: listError,
  } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return { error: "Error al buscar usuarios" };

  const found = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!found) return { error: "No se encontró un usuario con ese correo" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", updated_at: new Date().toISOString() })
    .eq("user_id", found.id);

  if (error) return { error: "Error al asignar rol de administrador" };

  revalidatePath("/admin/users");
  return { success: true };
}
