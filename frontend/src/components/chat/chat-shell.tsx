"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Search, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatShellMember = {
  id: string;
  name: string;
  title?: string | null;
  online?: boolean;
};

export function ChatShell({
  channelLabel,
  title,
  subtitle,
  members,
  membersHeading = "Members",
  myId,
  sidebarExtra,
  mobileStrip,
  empty,
  children,
  composerValue,
  onComposerChange,
  onSend,
  sending = false,
  placeholder = "Write a message…",
  className,
}: {
  channelLabel: string;
  title: string;
  subtitle?: string;
  members: ChatShellMember[];
  membersHeading?: string;
  myId?: string;
  sidebarExtra?: ReactNode;
  mobileStrip?: ReactNode;
  empty?: ReactNode;
  children: ReactNode;
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const otherMembers = members.filter((m) => m.id !== myId);
  const onlineCount = otherMembers.filter((m) => m.online).length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [children]);

  return (
    <div
      className={cn(
        "chat-app flex h-[calc(100dvh-11.5rem)] min-w-0 overflow-hidden rounded-2xl border border-line bg-card shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] sm:rounded-[22px] lg:h-[calc(100dvh-7rem)]",
        className
      )}
    >
      <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-line bg-[color-mix(in_oklab,var(--card)_92%,var(--surface-muted))] lg:flex">
        <div className="border-b border-line px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            {channelLabel}
          </p>
          <p className="mt-1 truncate font-display text-base font-semibold text-fg">
            {title}
          </p>
          {subtitle && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
              {subtitle}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line/80 bg-surface-muted/70 px-3 py-2 text-xs text-fg-subtle">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>
              {otherMembers.length} member
              {otherMembers.length === 1 ? "" : "s"}
              {onlineCount > 0 ? ` · ${onlineCount} online` : ""}
            </span>
          </div>
        </div>

        {sidebarExtra ? (
          <div className="border-b border-line px-3 py-3">{sidebarExtra}</div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            {membersHeading}
          </p>
          <div className="space-y-0.5">
            {otherMembers.length === 0 && (
              <p className="px-2 py-2 text-xs text-fg-subtle">
                No other people in this room yet.
              </p>
            )}
            {otherMembers.map((m) => (
              <div
                key={m.id}
                className="flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-surface-muted"
              >
                <div className="relative shrink-0">
                  <Avatar name={m.name} size="sm" />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                      m.online ? "bg-emerald" : "bg-fg-subtle/50"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{m.name}</p>
                  {m.title ? (
                    <p className="truncate text-[11px] text-fg-subtle">{m.title}</p>
                  ) : (
                    <p className="truncate text-[11px] text-fg-subtle">
                      {m.online ? "Online" : "Member"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-10 flex h-[3.75rem] items-center gap-3 border-b border-line bg-card/95 px-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative hidden sm:block">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/12 text-sm font-semibold text-brand">
                {title.slice(0, 1).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-[15px] font-semibold text-fg">
                {title}
              </p>
              <p className="truncate text-xs text-fg-subtle">
                {subtitle || channelLabel}
              </p>
            </div>
          </div>
          {otherMembers.length > 0 && (
            <div className="hidden items-center -space-x-2 sm:flex">
              {otherMembers.slice(0, 4).map((m) => (
                <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-card" />
              ))}
              {otherMembers.length > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-[10px] font-medium text-fg-muted ring-2 ring-card">
                  +{otherMembers.length - 4}
                </div>
              )}
            </div>
          )}
        </header>

        {mobileStrip}

        <div
          ref={scrollRef}
          className="chat-thread relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin"
        >
          <div className="relative z-[1] mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-1 px-3 py-4 sm:px-5 sm:py-6">
            {empty}
            {children}
            <div ref={endRef} />
          </div>
        </div>

        <div className="relative z-10 border-t border-line bg-card/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4">
          <form
            className="mx-auto flex max-w-3xl items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <textarea
                value={composerValue}
                onChange={(e) => onComposerChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                rows={1}
                placeholder={placeholder}
                className="max-h-32 min-h-[2.75rem] w-full resize-none rounded-[1.35rem] border border-line bg-surface-muted px-4 py-3 pr-12 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-brand/45 focus:bg-card focus:ring-2 focus:ring-brand/15"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              loading={sending}
              disabled={!composerValue.trim()}
              className="h-11 w-11 shrink-0 rounded-full p-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-[11px] text-fg-subtle">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChatEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto my-10 max-w-sm rounded-2xl border border-dashed border-line bg-card/60 px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Send className="h-5 w-5" />
      </div>
      <p className="font-display text-base font-semibold text-fg">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{description}</p>
    </div>
  );
}
