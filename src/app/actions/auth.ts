"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type AuthResult = {
  error?: string;
};

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "Email o contraseña incorrectos" };
    }
    return { error: "Error al iniciar sesión. Intenta de nuevo." };
  }

  const redirectTo = formData.get("redirect") as string | null;
  redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

  const supabase = await createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: fullName,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Ya existe una cuenta con ese email" };
    }
    return { error: "Error al crear la cuenta. Intenta de nuevo." };
  }

  // Save initial shipping address if provided
  const country = formData.get("country") as string | null;
  const state   = formData.get("state")   as string | null;
  const city    = formData.get("city")    as string | null;
  const street  = formData.get("address") as string | null;
  const zipCode = formData.get("zip_code") as string | null;

  if (signUpData.user && country && state && city && street) {
    const initialAddress = {
      id: crypto.randomUUID(),
      label: "Casa",
      street,
      city,
      state,
      department: state, // backward compat
      country,
      zip_code: zipCode || undefined,
      is_default: true,
    };
    // Best-effort: update profile created by trigger
    await supabase
      .from("profiles")
      .update({ addresses: [initialAddress], name: fullName })
      .eq("user_id", signUpData.user.id);
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
