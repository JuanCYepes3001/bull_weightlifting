import { readFileSync } from "fs";
import { join } from "path";

export const LEGAL_SLUGS = ["terminos", "privacidad", "envios", "devoluciones"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

// Debe coincidir con el ENUM legal_document_status de la migración 019
export type LegalDocumentStatus = "borrador" | "vigente" | "archivado";
const VALID_STATUSES: LegalDocumentStatus[] = ["borrador", "vigente", "archivado"];

export type LegalDocument = {
  slug: string;
  version: number;
  title: string;
  status: LegalDocumentStatus;
  updated: string;
  content: string;
};

const LEGAL_DIR = join(process.cwd(), "src", "content", "legal");

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }

  return { data, content: match[2].trim() };
}

export function getLegalDocument(slug: string): LegalDocument | null {
  let raw: string;
  try {
    raw = readFileSync(join(LEGAL_DIR, `${slug}.md`), "utf-8");
  } catch {
    return null;
  }

  const { data, content } = parseFrontmatter(raw);
  const { slug: docSlug, version, title, status, updated } = data;

  if (
    !docSlug ||
    docSlug !== slug ||
    !version ||
    !title ||
    !updated ||
    !VALID_STATUSES.includes(status as LegalDocumentStatus)
  ) {
    return null;
  }

  return {
    slug: docSlug,
    version: Number(version),
    title,
    status: status as LegalDocumentStatus,
    updated,
    content,
  };
}
