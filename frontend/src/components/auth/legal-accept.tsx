"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasAcceptedLegal, setAcceptedLegal } from "@/lib/legal";
import { cn } from "@/lib/utils";

export function AuthLegalAccept({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-muted/60 px-3.5 py-3 text-left",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const next = e.target.checked;
          onChange(next);
          if (next) setAcceptedLegal();
        }}
        className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong accent-[var(--brand)]"
        required
      />
      <span className="text-[13px] leading-relaxed text-fg-muted">
        I agree to the{" "}
        <Link
          href="/terms"
          target="_blank"
          className="font-semibold text-brand hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="font-semibold text-brand hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>
        . I confirm I have permission to use this Site if I am under 18.
      </span>
    </label>
  );
}

// remember if they already ticked accept for this version
export function useLegalAcceptance() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setAccepted(hasAcceptedLegal());
  }, []);

  return [accepted, setAccepted] as const;
}
