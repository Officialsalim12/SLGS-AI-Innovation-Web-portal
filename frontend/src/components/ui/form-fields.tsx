"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ className, label, error, id, type = "text", ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={cn(
            "h-11 w-full rounded-2xl border border-line bg-input px-4 text-sm text-fg placeholder:text-fg-subtle outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60",
            isPassword && "pr-11",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-fg-subtle transition hover:text-fg"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-300">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "min-h-28 w-full rounded-2xl border border-line bg-input px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20",
          className
        )}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";
