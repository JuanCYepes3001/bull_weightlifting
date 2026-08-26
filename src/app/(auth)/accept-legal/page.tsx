import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { needsLegalAcceptance } from "@/lib/legal/acceptance";
import { AcceptLegalForm } from "./AcceptLegalForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aceptar términos y privacidad",
};

interface AcceptLegalPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AcceptLegalPage({ searchParams }: AcceptLegalPageProps) {
  const { next } = await searchParams;
  const safeNext = next && /^\/(?!\/)/.test(next) ? next : "/";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=${encodeURIComponent(safeNext)}`);

  // Chequeo en servidor, no en cliente: si ya aceptó (o llegó acá sin
  // necesitarlo), no tiene sentido mostrarle la pantalla — lo mandamos
  // directo a donde iba.
  const adminClient = createAdminClient();
  const pending = await needsLegalAcceptance(adminClient, user.id);
  if (!pending) redirect(safeNext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl text-white mb-2">Antes de continuar</h1>
        <p className="font-body text-sm text-white/50 leading-relaxed">
          Para usar la tienda necesitamos que aceptes estos dos documentos.
        </p>
      </div>

      <AcceptLegalForm next={safeNext} />
    </div>
  );
}
