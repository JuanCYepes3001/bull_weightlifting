"use client";

import { cn } from "@/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-heading tracking-widest uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-crimson text-white hover:bg-crimson-light active:scale-[0.98] shadow-lg shadow-crimson/20",
      secondary:
        "border border-white/20 text-white hover:bg-white/5 active:scale-[0.98]",
      ghost:
        "text-white/60 hover:text-white hover:bg-white/5 active:scale-[0.98]",
      danger:
        "bg-red-900/80 text-white hover:bg-red-800 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-4 text-xs gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-13 px-8 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
