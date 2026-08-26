import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { getLegalDocument, LEGAL_SLUGS } from "@/lib/legal/documents";
import { legalMarkdownComponents } from "@/lib/legal/markdown-components";

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

// Set fijo de 4 slugs: cualquier otro valor debe dar 404 real (no 200
// con el contenido de "no encontrado"), así que no se generan params
// dinámicos fuera de esta lista.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocument(slug);
  if (!doc) return { title: "Documento no encontrado" };
  return { title: doc.title };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) notFound();

  const updatedLabel = new Date(doc.updated).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-body text-xs text-white/30 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Volver al inicio
      </Link>

      <h1 className="text-2xl md:text-3xl text-white mb-2">{doc.title}</h1>

      <p className="font-body text-xs text-white/30 tracking-wide mb-8">
        Versión {doc.version} · Actualizado el {updatedLabel}
      </p>

      {doc.status === "borrador" && (
        <div className="flex items-start gap-3 border border-crimson/40 bg-crimson/10 px-4 py-3 mb-10">
          <AlertTriangle size={16} className="text-crimson flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm text-crimson">
            Este documento es un borrador preliminar, pendiente de aprobación.
            El contenido puede cambiar antes de su versión definitiva.
          </p>
        </div>
      )}

      <article>
        <ReactMarkdown components={legalMarkdownComponents}>{doc.content}</ReactMarkdown>
      </article>
    </div>
  );
}
