"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  /** Ordered list of URLs to try. First one that loads wins. */
  candidates: string[];
  alt: string;
  sizes?: string;
  className?: string;
  placeholderTextClassName?: string;
}

/**
 * Renders the first candidate URL that actually loads, advancing through
 * the list on error. Falls back to the branded placeholder (matching
 * ProductCard's no-image state) once every candidate has failed — instead
 * of a broken-image icon, which is what plain <Image src=... /> shows when
 * the file doesn't exist in Supabase Storage.
 */
export function ProductImage({
  candidates,
  alt,
  sizes,
  className,
  placeholderTextClassName = "font-heading text-crimson/20 text-6xl tracking-widest select-none",
}: ProductImageProps) {
  const [index, setIndex] = useState(0);
  // Reset the candidate index when the candidate list changes (e.g. user
  // picked a different color) — adjusted during render per React's guidance,
  // rather than in a useEffect, to avoid an extra render pass.
  const [prevCandidates, setPrevCandidates] = useState(candidates);
  if (candidates !== prevCandidates) {
    setPrevCandidates(candidates);
    setIndex(0);
  }

  const src = candidates[index];

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className={placeholderTextClassName} aria-hidden="true">
          BULL
        </span>
      </div>
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
