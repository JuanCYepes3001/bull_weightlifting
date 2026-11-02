"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getLegalDocumentAction } from "@/app/actions/legal";
import { legalMarkdownComponents } from "@/lib/legal/markdown-components";
import type { LegalDocument, LegalSlug } from "@/lib/legal/documents";

interface LegalModalProps {
  slug: LegalSlug;
  children: React.ReactNode;
  className?: string;
}

type FetchStatus = "idle" | "loading" | "loaded" | "error";

export function LegalModal({ slug, children, className }: LegalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");

  // El navegador enfoca el primer elemento enfocable del <dialog> (el botón
  // de cerrar) al llamar showModal() — cubre "foco al abrir" sin código extra.
  const handleOpen = () => {
    dialogRef.current?.showModal();
    if (status !== "idle") return;

    setStatus("loading");
    getLegalDocumentAction(slug)
      .then((result) => {
        if (result) {
          setDoc(result);
          setStatus("loaded");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  };

  const handleClose = () => {
    dialogRef.current?.close();
  };

  // El evento "close" cubre ESC, click en backdrop y el botón de cerrar —
  // un solo listener devuelve el foco al disparador en los tres casos.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => triggerRef.current?.focus();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        className={
          className ??
          "text-white underline underline-offset-4 hover:text-crimson transition-colors"
        }
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === dialogRef.current) handleClose();
        }}
        className="m-auto w-[90vw] max-w-2xl max-h-[85vh] p-0 bg-carbon border border-white/10 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col max-h-[85vh]">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4 flex-shrink-0">
            <h2
              id={titleId}
              className="font-heading text-sm tracking-widest uppercase text-white"
            >
              {doc?.title ?? "Cargando…"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </header>

          <div className="overflow-y-auto px-6 py-5">
            {status === "loading" && (
              <p className="font-body text-sm text-white/40">Cargando documento…</p>
            )}
            {status === "error" && (
              <p className="font-body text-sm text-red-400">
                No se pudo cargar el documento. Intenta de nuevo.
              </p>
            )}
            {doc && status === "loaded" && (
              <>
                {doc.status === "borrador" && (
                  <div className="border border-crimson/40 bg-crimson/10 px-4 py-3 mb-6">
                    <p className="font-body text-xs text-crimson">
                      Borrador preliminar, pendiente de aprobación. El contenido puede
                      cambiar antes de su versión definitiva.
                    </p>
                  </div>
                )}
                <ReactMarkdown components={legalMarkdownComponents}>
                  {doc.content}
                </ReactMarkdown>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
