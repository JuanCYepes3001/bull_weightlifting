"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// ── Rate limiters (Upstash Redis) ────────────────────────────────────────────
// Optional: only active when UPSTASH_REDIS_REST_URL + TOKEN are configured.
// Without them the limiters are skipped (no crash, but no rate limiting).
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = UPSTASH_URL && UPSTASH_TOKEN
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
  : null;

const loginLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "15 m"), prefix: "rl:login" })
  : null;

const resetLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "15 m"), prefix: "rl:reset" })
  : null;

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
// ─────────────────────────────────────────────────────────────────────────────

type AuthResult = {
  error?: string;
  verificationSent?: boolean;
};

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const ip = await getClientIp();
  if (loginLimiter) {
    const { success: loginOk } = await loginLimiter.limit(`login:${ip}`);
    if (!loginOk) return { error: "Demasiados intentos. Espera 15 minutos e intenta de nuevo." };
  }

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
    if (error.code === "email_not_confirmed") {
      return { error: "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada." };
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
      emailRedirectTo: `${process.env.SITE_URL ?? "http://localhost:3000"}/api/auth/callback`,
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
  const phone   = formData.get("phone") as string | null;

  if (signUpData.user) {
    const updates: Record<string, unknown> = { name: fullName };

    if (phone?.trim()) updates.phone = phone.trim();

    if (country && state && city && street) {
      updates.addresses = [
        {
          id: crypto.randomUUID(),
          label: "Casa",
          street,
          city,
          state,
          department: state,
          country,
          zip_code: zipCode || undefined,
          is_default: true,
        },
      ];
    }

    // Use admin client to bypass RLS — user has no active session during email confirmation
    const adminClient = createAdminClient();
    const { error: upsertError } = await adminClient
      .from("profiles")
      .upsert({ user_id: signUpData.user.id, ...updates }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("[registerAction] profile upsert failed:", upsertError.message, upsertError.code);
    }
  }

  // If session exists, email confirmation is disabled — user is already logged in
  if (signUpData.session) {
    redirect("/");
  }
  // Email confirmation required — notify user to check their inbox
  return { verificationSent: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Email requerido" };

  // Rate limit by email: max 3 reset emails per 15 minutes
  if (resetLimiter) {
    const { success: resetOk } = await resetLimiter.limit(`reset:${email.toLowerCase()}`);
    if (!resetOk) return { error: "Ya enviamos un correo recientemente. Espera 15 minutos antes de intentar de nuevo." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/reset-password`,
  });

  if (error) return { error: "Error al enviar el correo. Intenta de nuevo." };
  return {};
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8)
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  if (password !== confirmPassword)
    return { error: "Las contraseñas no coinciden" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: "Error al actualizar la contraseña. Intenta de nuevo." };
  redirect("/profile/account");
}

export async function deleteAccountAction(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión inválida" };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) return { error: "Error al eliminar la cuenta. Intenta de nuevo." };

  await supabase.auth.signOut();
  redirect("/");
}

export async function changePasswordAction(formData: FormData): Promise<AuthResult> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 8)
    return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  if (newPassword !== confirmPassword)
    return { error: "Las contraseñas no coinciden" };

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) return { error: "Sesión inválida" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Contraseña actual incorrecta" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Error al actualizar la contraseña" };
  return {};
}
