import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { needsLegalAcceptance } from "@/lib/legal/acceptance";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const user = data.session.user;
      const provider = user.app_metadata?.provider;

      // Prevent open redirect — se usa en cualquier redirect de acá en adelante
      const safePath = /^\/(?!\/)/.test(next) ? next : "/";

      // For OAuth (Google, etc.): sync name from provider metadata and detect new users
      if (provider && provider !== "email") {
        const meta = user.user_metadata ?? {};
        const name = (meta.full_name ?? meta.name ?? null) as string | null;

        const adminClient = createAdminClient();

        // Upsert name — trigger already created the row but this keeps name in sync
        await adminClient
          .from("profiles")
          .upsert({ user_id: user.id, name }, { onConflict: "user_id" });

        // signInWithOAuth se llama desde el cliente y nunca pasa por
        // registerAction — un usuario que entra con Google no aceptó nada
        // todavía. Chequeo en servidor (no confiable del lado del cliente):
        // si le falta aceptar los documentos vigentes, lo mandamos a
        // aceptarlos antes de dejarlo usar la tienda.
        if (await needsLegalAcceptance(adminClient, user.id)) {
          return NextResponse.redirect(
            `${origin}/accept-legal?next=${encodeURIComponent(safePath)}`
          );
        }

        // Redirect new OAuth users to profile to complete address & phone
        const { data: profile } = await adminClient
          .from("profiles")
          .select("addresses, phone")
          .eq("user_id", user.id)
          .single();

        const addresses = (profile?.addresses as unknown[]) ?? [];
        if (addresses.length === 0) {
          return NextResponse.redirect(`${origin}/profile/account?welcome=1`);
        }
      }

      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
