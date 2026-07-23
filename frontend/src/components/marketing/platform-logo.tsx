import Image from "next/image";
import { cn } from "@/lib/utils";

const iconClass = "h-8 w-8";

export function PlatformLogo({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const common = cn(iconClass, className);

  // logos we keep as svg files
  if (id === "render" || id === "chatgpt" || id === "canva") {
    const src =
      id === "chatgpt"
        ? "/images/platforms/openai.svg"
        : `/images/platforms/${id}.svg`;
    return (
      <Image
        src={src}
        alt=""
        width={32}
        height={32}
        className={cn("object-contain dark:invert", common)}
        unoptimized
      />
    );
  }

  switch (id) {
    case "vercel":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path fill="currentColor" d="M12 2L2 19.5h20L12 2z" />
        </svg>
      );
    case "supabase":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path
            fill="currentColor"
            d="M13.3 2.1c-.4-.7-1.4-.5-1.5.3L10.4 14H6.2c-.8 0-1.3.9-.8 1.5l7.3 8.4c.5.6 1.4.2 1.4-.6l1.2-10.2h4.4c.8 0 1.3-.9.8-1.5L13.3 2.1z"
          />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
          <path
            fill="currentColor"
            d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"
          />
        </svg>
      );
    default:
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
          {id[0]?.toUpperCase()}
        </span>
      );
  }
}
