import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getLegalDocument } from "@/lib/legal/documents";

type AdminClient = SupabaseClient<Database>;

// Reintentos con backoff corto antes de dar por fallido un insert de
// evidencia — ver recordLegalAcceptances() más abajo para el motivo de
// no revertir la cuenta cuando incluso los reintentos fallan.
const RETRY_DELAYS_MS = [200, 500];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// El .md en src/content/legal/ es la única fuente de verdad para el
// contenido y la versión de cada documento. Esta función sincroniza (upsert,
// sin pisar el status real del .md) la fila espejo en legal_documents y
// devuelve su id — nunca hardcodea "vigente": si el .md dice "borrador"
// (ej. en dev), la fila sincronizada dice "borrador", honestamente.
export async function resolveLegalDocumentId(
  adminClient: AdminClient,
  slug: string
): Promise<string | null> {
  const doc = getLegalDocument(slug);
  if (!doc) {
    console.error(
      `[LEGAL_DOCUMENT_SYNC_FAILED] getLegalDocument("${slug}") devolvió null — no se encontró o no se pudo parsear el .md`
    );
    return null;
  }

  const { data, error } = await adminClient
    .from("legal_documents")
    .upsert(
      { slug: doc.slug, version: doc.version, title: doc.title, status: doc.status },
      { onConflict: "slug,version" }
    )
    .select("id")
    .single();

  if (error || !data) {
    console.error(
      `[LEGAL_DOCUMENT_SYNC_FAILED] upsert de legal_documents falló para "${slug}"`,
      {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      }
    );
    return null;
  }
  return data.id;
}

// Documentos que hoy se exigen para poder usar la tienda (registro por
// email y, desde el Punto 7, también login/registro por Google). Si en el
// futuro se suman envíos/devoluciones a la aceptación obligatoria, alcanza
// con agregarlos acá — todo lo que los consume (callback OAuth, pantalla
// de aceptación) itera sobre esta lista, no slugs sueltos hardcodeados.
export const REQUIRED_ACCEPTANCE_SLUGS = ["terminos", "privacidad"] as const;

// Resuelve (con el upsert perezoso de resolveLegalDocumentId) los
// document_id de todos los REQUIRED_ACCEPTANCE_SLUGS. Devuelve null si
// alguno no se pudo resolver — el llamador decide cómo degradar (nunca
// bloquear al usuario por un problema de sincronización de nuestro lado).
export async function resolveRequiredLegalDocuments(
  adminClient: AdminClient
): Promise<AcceptanceInput[] | null> {
  const ids = await Promise.all(
    REQUIRED_ACCEPTANCE_SLUGS.map((slug) => resolveLegalDocumentId(adminClient, slug))
  );

  if (ids.some((id) => !id)) return null;

  return REQUIRED_ACCEPTANCE_SLUGS.map((slug, i) => ({
    slug,
    documentId: ids[i] as string,
  }));
}

// True si al usuario le falta aceptar alguno de los documentos vigentes
// requeridos. Ante cualquier fallo para determinarlo (documentos no
// resolubles, error de red/DB) devuelve false — no bloqueamos el acceso a
// la tienda por un problema de nuestro lado; queda igual detectable vía
// scripts/audit-legal-acceptances.sql.
export async function needsLegalAcceptance(
  adminClient: AdminClient,
  userId: string
): Promise<boolean> {
  const documents = await resolveRequiredLegalDocuments(adminClient);
  if (!documents) return false;

  const { data, error } = await adminClient
    .from("legal_acceptances")
    .select("document_id")
    .eq("user_id", userId)
    .in(
      "document_id",
      documents.map((d) => d.documentId)
    );

  if (error) {
    console.error("[LEGAL_ACCEPTANCE_CHECK_FAILED] no se pudo consultar legal_acceptances", {
      message: error.message,
      code: error.code,
      userId,
    });
    return false;
  }

  const acceptedIds = new Set((data ?? []).map((row) => row.document_id));
  return documents.some((d) => !acceptedIds.has(d.documentId));
}

type AcceptanceInput = {
  slug: string;
  documentId: string;
};

type RecordAcceptancesParams = {
  userId: string;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  documents: AcceptanceInput[];
};

async function insertAcceptanceWithRetry(
  adminClient: AdminClient,
  row: Database["public"]["Tables"]["legal_acceptances"]["Insert"]
): Promise<boolean> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const { error } = await adminClient.from("legal_acceptances").insert(row);
    if (!error) return true;
    if (attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  return false;
}

// Registra una fila de evidencia por documento. Nunca lanza ni revierte la
// cuenta ya creada: un rollback destructivo en el camino crítico del
// registro es peor que loggear y dejarlo detectable por auditoría (ver
// scripts/audit-legal-acceptances.sql). Si un insert falla tras los
// reintentos, queda marcado con el prefijo [LEGAL_EVIDENCE_MISSING] en los
// logs del servidor para que se pueda remediar manualmente.
export async function recordLegalAcceptances(
  adminClient: AdminClient,
  { userId, email, ipAddress, userAgent, documents }: RecordAcceptancesParams
): Promise<void> {
  for (const { slug, documentId } of documents) {
    const ok = await insertAcceptanceWithRetry(adminClient, {
      user_id: userId,
      user_email: email,
      document_id: documentId,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (!ok) {
      console.error(
        `[LEGAL_EVIDENCE_MISSING] No se pudo registrar la aceptación de "${slug}" tras reintentos — user_id=${userId} email=${email}`
      );
    }
  }
}
