// scripts/migrate.mjs
// Ejecuta: node scripts/migrate.mjs
import { readFileSync } from "fs";
import { resolve } from "path";

// Leer .env.local
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const accessToken = env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !accessToken) {
  console.error(
    "Faltan variables en .env.local:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL  → ya la tienes\n" +
      "  SUPABASE_ACCESS_TOKEN     → créalo en https://supabase.com/dashboard/account/tokens\n"
  );
  process.exit(1);
}

// Extraer el project ref de la URL (https://<ref>.supabase.co)
const ref = supabaseUrl.replace("https://", "").replace(".supabase.co", "");

const SQL = `
  ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS color_hex TEXT;
`;

console.log(`Ejecutando migración en proyecto: ${ref}`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: SQL }),
  }
);

const body = await res.json();

if (!res.ok) {
  console.error("Error:", body);
  process.exit(1);
}

console.log("✓ Migración ejecutada correctamente.");
console.log(body);
