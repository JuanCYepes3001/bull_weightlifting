import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface ServerUserResult {
  user: User | null;
  profile: Profile | null;
}

/**
 * Returns the authenticated user + profile from server components.
 */
export async function getServerUser(): Promise<ServerUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return { user, profile: profile as Profile | null };
}

/**
 * Requires auth — redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<{
  user: User;
  profile: Profile | null;
}> {
  const { user, profile } = await getServerUser();
  if (!user) redirect("/login");
  return { user, profile };
}

/**
 * Requires admin role — redirects if not admin.
 */
export async function requireAdmin(): Promise<{
  user: User;
  profile: Profile;
}> {
  const { user, profile } = await getServerUser();
  if (!user || !profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");
  return { user, profile };
}
