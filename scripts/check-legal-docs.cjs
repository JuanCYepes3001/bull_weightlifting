// scripts/check-legal-docs.cjs
// Guard de build: en producción, los 4 documentos legales deben existir
// y estar en status "vigente" (aprobados por la dueña), o el build falla.
// También ejecutable a mano: node scripts/check-legal-docs.cjs
const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");

const LEGAL_DIR = join(__dirname, "..", "src", "content", "legal");

// Deben coincidir con el ENUM legal_document_status de la migración 019
const VALID_STATUSES = ["borrador", "vigente", "archivado"];
const REQUIRED_SLUGS = ["terminos", "privacidad", "envios", "devoluciones"];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }
  return data;
}

function checkLegalDocuments() {
  let files;
  try {
    files = readdirSync(LEGAL_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return {
      ok: false,
      errors: [`No se encontró el directorio de documentos legales: ${LEGAL_DIR}`],
    };
  }

  const errors = [];
  const found = new Map();

  for (const file of files) {
    const raw = readFileSync(join(LEGAL_DIR, file), "utf-8");
    const data = parseFrontmatter(raw);

    if (!data.slug) {
      errors.push(`${file}: falta "slug" en el frontmatter`);
      continue;
    }
    if (!VALID_STATUSES.includes(data.status)) {
      errors.push(
        `${file}: status "${data.status}" inválido (debe ser: ${VALID_STATUSES.join(" | ")})`
      );
      continue;
    }
    found.set(data.slug, data.status);
  }

  for (const slug of REQUIRED_SLUGS) {
    if (!found.has(slug)) {
      errors.push(`Falta el documento legal requerido: "${slug}"`);
      continue;
    }
    if (found.get(slug) !== "vigente") {
      errors.push(
        `El documento "${slug}" está en status "${found.get(slug)}", debe estar "vigente" para producción`
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { checkLegalDocuments };

if (require.main === module) {
  const { ok, errors } = checkLegalDocuments();
  if (!ok) {
    console.error("✗ Guard de documentos legales falló:\n");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log("✓ Todos los documentos legales están vigentes.");
}
