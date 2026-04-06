"use client";

import { useRef, useState } from "react";
import { X, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface ImageEntry {
  url: string;
  alt: string;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
}

type Mode = "url" | "file";

interface RowState {
  mode: Mode;
  uploading: boolean;
  error: string | null;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [rows, setRows] = useState<RowState[]>(
    images.map(() => ({ mode: "url" as Mode, uploading: false, error: null }))
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addImage = () => {
    onChange([...images, { url: "", alt: "" }]);
    setRows((r) => [...r, { mode: "url", uploading: false, error: null }]);
  };

  const removeImage = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
    setRows((r) => r.filter((_, idx) => idx !== i));
  };

  const updateImage = (i: number, key: keyof ImageEntry, val: string) => {
    onChange(images.map((img, idx) => (idx === i ? { ...img, [key]: val } : img)));
  };

  const setRowMode = (i: number, mode: Mode) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, mode, error: null } : row)));
    if (mode === "file") {
      setTimeout(() => fileInputRefs.current[i]?.click(), 50);
    }
  };

  const handleFileChange = async (i: number, file: File | null) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setRows((r) =>
        r.map((row, idx) =>
          idx === i ? { ...row, error: "Máximo 5MB por imagen" } : row
        )
      );
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      setRows((r) =>
        r.map((row, idx) =>
          idx === i ? { ...row, error: "Formato no permitido. Usa JPG, PNG, WebP o AVIF" } : row
        )
      );
      return;
    }

    setRows((r) =>
      r.map((row, idx) =>
        idx === i ? { ...row, uploading: true, error: null } : row
      )
    );

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("products")
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(data.path);

      updateImage(i, "url", publicUrl);
      setRows((r) =>
        r.map((row, idx) =>
          idx === i ? { ...row, uploading: false, mode: "url" } : row
        )
      );
    } catch {
      setRows((r) =>
        r.map((row, idx) =>
          idx === i
            ? { ...row, uploading: false, error: "Error al subir la imagen. Verifica que el bucket 'products' esté activo." }
            : row
        )
      );
    }
  };

  return (
    <div className="space-y-3">
      {images.length === 0 && (
        <p className="font-body text-xs text-white/20 py-1">
          Sin imágenes. Sube archivos o pega URLs.
        </p>
      )}

      {images.map((img, i) => {
        const row = rows[i] ?? { mode: "url", uploading: false, error: null };
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex gap-2 items-start">
              {/* Mode toggle */}
              <div className="flex flex-col gap-1 flex-shrink-0 pt-0.5">
                <button
                  type="button"
                  title="Pegar URL"
                  onClick={() => setRowMode(i, "url")}
                  className={`p-1.5 transition-colors rounded-sm ${
                    row.mode === "url"
                      ? "text-crimson bg-crimson/10 border border-crimson/30"
                      : "text-white/20 hover:text-white/50 border border-white/10"
                  }`}
                >
                  <LinkIcon size={11} />
                </button>
                <button
                  type="button"
                  title="Subir archivo"
                  onClick={() => setRowMode(i, "file")}
                  className={`p-1.5 transition-colors rounded-sm ${
                    row.mode === "file"
                      ? "text-crimson bg-crimson/10 border border-crimson/30"
                      : "text-white/20 hover:text-white/50 border border-white/10"
                  }`}
                >
                  <Upload size={11} />
                </button>
              </div>

              {/* Input area */}
              <div className="flex-1 space-y-1">
                {row.mode === "url" ? (
                  <input
                    type="url"
                    value={img.url}
                    onChange={(e) => updateImage(i, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 font-body text-xs text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                  />
                ) : (
                  <div
                    onClick={() => fileInputRefs.current[i]?.click()}
                    className={`w-full border border-dashed px-3 py-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      row.uploading
                        ? "border-white/10 bg-white/2"
                        : "border-white/15 hover:border-crimson/40 hover:bg-crimson/5"
                    }`}
                  >
                    {row.uploading ? (
                      <>
                        <Loader2 size={13} className="text-crimson animate-spin" />
                        <span className="font-body text-xs text-white/40">
                          Subiendo...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-white/30" />
                        <span className="font-body text-xs text-white/30">
                          {img.url ? "Cambiar archivo" : "Seleccionar imagen"}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateImage(i, "alt", e.target.value)}
                  placeholder="Texto alternativo (SEO)"
                  className="w-full bg-white/5 border border-white/10 px-3 py-1.5 font-body text-[11px] text-white placeholder-white/15 focus:outline-none focus:border-crimson/40"
                />
              </div>

              {/* Preview */}
              {img.url && !row.uploading && (
                <img
                  src={img.url}
                  alt=""
                  className="w-12 h-14 object-cover border border-white/10 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                aria-label="Eliminar imagen"
              >
                <X size={13} />
              </button>
            </div>

            {row.error && (
              <p className="font-body text-[10px] text-red-400 pl-8">
                {row.error}
              </p>
            )}

            {/* Hidden file input */}
            <input
              ref={(el) => { fileInputRefs.current[i] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={addImage}
        className="flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-crimson hover:text-crimson-light transition-colors"
      >
        <Upload size={11} /> Agregar imagen
      </button>
    </div>
  );
}
