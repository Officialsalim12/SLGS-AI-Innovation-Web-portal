"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

let pushToast: ((message: string, kind?: ToastKind) => void) | null = null;

export function toast(message: string, kind: ToastKind = "info") {
  pushToast?.(message, kind);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (message, kind = "info") => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  return (
    <>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 md:bottom-6">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className={cn(
                  "pointer-events-auto glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-2xl"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    t.kind === "success" && "text-emerald-light",
                    t.kind === "error" && "text-red-300",
                    t.kind === "info" && "text-blue-light"
                  )}
                />
                <p className="flex-1 text-sm text-fg">{t.message}</p>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((x) => x.id !== t.id))
                  }
                  className="text-fg-subtle hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
