"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  /** Rendered instead of the <Image> once the source fails to load (e.g. deleted/missing file in storage). */
  fallback: React.ReactNode;
}

/** Wraps next/image and swaps to `fallback` on load error, instead of showing a broken-image icon. */
export function SafeImage({ fallback, src, alt, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  // Reset the failed flag when the source changes, adjusted during render
  // (React's recommended pattern) rather than via useEffect.
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setFailed(false);
  }

  if (failed) return <>{fallback}</>;

  return <Image {...props} src={src} alt={alt} onError={() => setFailed(true)} />;
}
