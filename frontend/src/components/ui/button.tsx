"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-hover hover:shadow-brand/35 dark:text-navy",
  secondary:
    "bg-white text-ink shadow-lg shadow-black/20 hover:bg-white/95 dark:bg-white dark:text-ink",
  ghost: "bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg",
  outline:
    "bg-transparent border border-line-strong text-fg hover:bg-surface-muted hover:border-line-strong",
  danger: "bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30 hover:bg-red-500/25",
  success:
    "bg-emerald/15 text-emerald-700 dark:text-emerald-light border border-emerald/30 hover:bg-emerald/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-sm rounded-2xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
  icon: "h-10 w-10 rounded-2xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      magnetic = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      variants[variant],
      sizes[size],
      className
    );

    if (magnetic) {
      return (
        <motion.button
          ref={ref}
          className={classes}
          disabled={disabled || loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          {...(props as React.ComponentProps<typeof motion.button>)}
        >
          {loading ? (
            <span
              className={cn(
                "h-4 w-4 animate-spin rounded-full border-2",
                variant === "primary"
                  ? "border-white/30 border-t-white"
                  : "border-brand/25 border-t-brand"
              )}
            />
          ) : (
            children
          )}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span
            className={cn(
              "h-4 w-4 animate-spin rounded-full border-2",
              variant === "primary"
                ? "border-white/30 border-t-white"
                : "border-brand/25 border-t-brand"
            )}
          />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
