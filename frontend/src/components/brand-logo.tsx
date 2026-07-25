import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "Sierra Leone Grammar School";

export function BrandLogo({
  className,
  size = 36,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/brand/Logo.png"
      alt={BRAND_NAME}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

export function BrandMark({
  size = 52,
  priority = false,
  stacked = false,
  showName = false,
  light = false,
  className,
  nameClassName,
}: {
  size?: number;
  priority?: boolean;
  stacked?: boolean;
  showName?: boolean;
  light?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        stacked && "flex-col gap-3 text-center",
        className
      )}
    >
      <BrandLogo size={size} priority={priority} className="shrink-0 rounded-lg" />
      {showName && (
        <span
          className={cn(
            "font-semibold leading-tight text-fg",
            light && "text-ink",
            stacked ? "text-lg" : "text-sm",
            nameClassName
          )}
        >
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
}
