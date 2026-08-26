"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLegalDocument, type LegalDocument } from "@/lib/legal/documents";
import { resolveRequiredLegalDocuments, recordLegalAcceptances } from "@/lib/legal/acceptance";
import { acceptLegalSchema } from "@/lib/validations/legal";

// getLegalDocument() usa fs.readFileSync — solo puede correr en servidor.
// Este wrapper es el puente para llamarlo desde Client Components (ej.
// LegalModal) sin convertir esas páginas en Server Components.
export async function getLegalDocumentAction(slug: string): Promise<LegalDocument | null> {
  return getLegalDocument(slug);
}

type LegalAcceptResult = { error?: string };

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Usado por la pantalla post-OAuth (Punto 7): signInWithOAuth se llama
// desde el cliente y nunca pasa por registerAction, así que un usuario que
// entra con Google no aceptó nada todavía por ese camino. Misma validación
// real del lado del servidor que registerAction, y reutiliza
// resolveRequiredLegalDocuments/recordLegalAcceptances del Punto 6 — mismo
// criterio de "nunca bloquear/revertir, loguear y dejar auditable" si el
// insert de evidencia falla tras los reintentos.
export async function acceptLegalAction(formData: FormData): Promise<LegalAcceptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { error: "Sesión inválida" };

  const raw = {
    // Validación real, del lado del servidor — igual que en registerAction:
    // si el checkbox no vino marcado (o no vino, ej. DOM manipulado),
    // formData.get() devuelve null/"false" y esto queda en false.
    acceptTerms: formData.get("acceptTerms") === "true",
    acceptPrivacy: formData.get("acceptPrivacy") === "true",
  };

  const parsed = acceptLegalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const adminClient = createAdminClient();
  const documents = await resolveRequiredLegalDocuments(adminClient);

  if (!documents) {
    console.error(
      "[LEGAL_DOCUMENT_SYNC_FAILED] no se pudieron resolver los documentos legales para la aceptación post-OAuth"
    );
    return { error: "No pudimos procesar tu aceptación. Intenta de nuevo en unos minutos." };
  }

  const ipAddress = await getClientIp();
  const userAgent = (await headers()).get("user-agent");

  await recordLegalAcceptances(adminClient, {
    userId: user.id,
    email: user.email,
    ipAddress,
    userAgent,
    documents,
  });

  const next = formData.get("next") as string | null;
  const safePath = next && /^\/(?!\/)/.test(next) ? next : "/";
  redirect(safePath);
}
