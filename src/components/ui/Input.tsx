"use client";

import { cn } from "@/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-heading tracking-widest uppercase text-white/60"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full bg-white/5 border px-4 text-sm text-white placeholder:text-white/30 rounded-none transition-colors",
            "focus:outline-none focus:border-crimson focus:bg-white/8",
            error ? "border-red-500/60" : "border-white/10",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-body">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-white/40 font-body">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
