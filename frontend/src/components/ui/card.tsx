"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  light?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  glass = true,
  light = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "min-w-0 overflow-hidden rounded-[1.25rem] p-4 text-fg sm:p-5",
        light
          ? "bg-white text-ink shadow-xl shadow-black/10"
          : glass
            ? "glass"
            : "border border-line bg-card",
        hover && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold tracking-tight text-fg">
          {title}
        </h3>
        {description && (
          <p className="mt-1 break-words text-sm text-fg-muted">{description}</p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
