import { cn, initials } from "@/lib/utils";

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple to-blue font-semibold text-white ring-2 ring-canvas",
        sizes[size],
        className
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export function AvatarGroup({
  people,
  max = 4,
}: {
  people: { name: string; avatar?: string }[];
  max?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.name} name={p.name} size="sm" />
      ))}
      {rest > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-fg-muted ring-2 ring-canvas">
          +{rest}
        </div>
      )}
    </div>
  );
}
