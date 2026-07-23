"use client";

import { useEffect, useRef, useState } from "react";
import {
  CornerUpRight,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ChatReaction = {
  emoji: string;
  count: number;
  mine?: boolean;
};

export type ChatMessageItem = {
  id: string;
  user: string;
  userId?: string;
  avatar?: string;
  time: string;
  text: string;
  deleted?: boolean;
  mine?: boolean;
  forwarded?: boolean;
  forwardedFrom?: { user: string; text: string } | null;
  reactions?: ChatReaction[];
};

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

export function ChatMessageBubble({
  message,
  currentChannel,
  onReact,
  onDelete,
  onForward,
  compact = false,
  forwardTargets = ["team", "mentor"],
}: {
  message: ChatMessageItem;
  currentChannel: "team" | "mentor";
  onReact: (messageId: string, emoji: string) => void | Promise<void>;
  onDelete: (messageId: string) => void | Promise<void>;
  onForward: (
    messageId: string,
    channel: "team" | "mentor"
  ) => void | Promise<void>;
  compact?: boolean;
  forwardTargets?: Array<"team" | "mentor">;
}) {
  const [reactOpen, setReactOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [actionsPinned, setActionsPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const menusOpen = reactOpen || forwardOpen || actionsPinned;

  useEffect(() => {
    if (!menusOpen) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setReactOpen(false);
        setForwardOpen(false);
        setActionsPinned(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menusOpen]);

  const deleted = Boolean(message.deleted);
  const targets = forwardTargets.length
    ? forwardTargets
    : ([currentChannel] as Array<"team" | "mentor">);

  async function run(action: () => void | Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "group/msg relative flex gap-3",
        message.mine && "flex-row-reverse"
      )}
      onMouseLeave={() => {
        if (!reactOpen && !forwardOpen) setActionsPinned(false);
      }}
    >
      <Avatar name={message.user} size={compact ? "sm" : "md"} />
      <div
        className={cn(
          "min-w-0 max-w-[min(100%,28rem)]",
          message.mine && "text-right"
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
            message.mine && "justify-end"
          )}
        >
          <span className="text-sm font-medium text-fg">{message.user}</span>
          <span className="text-[10px] text-fg-subtle">{message.time}</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          className={cn(
            "relative mt-1 inline-block max-w-full cursor-default rounded-2xl px-3.5 py-2.5 text-left shadow-sm outline-none",
            message.mine ? "bg-brand/12 text-fg" : "bg-card text-fg-muted",
            deleted && "italic text-fg-subtle"
          )}
          onClick={() => {
            if (deleted) return;
            // pin the action bar on tap (no hover on phones)
            setActionsPinned((v) => !v);
            setReactOpen(false);
            setForwardOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!deleted) setActionsPinned((v) => !v);
            }
          }}
        >
          {message.forwarded && !deleted && (
            <div className="mb-2 rounded-xl border border-line/70 bg-surface-muted/70 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                Forwarded
                {message.forwardedFrom?.user
                  ? ` · ${message.forwardedFrom.user}`
                  : ""}
              </p>
              {message.forwardedFrom?.text ? (
                <p className="mt-0.5 line-clamp-3 text-xs text-fg-muted">
                  {message.forwardedFrom.text}
                </p>
              ) : null}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
        </div>

        {(message.reactions?.length || 0) > 0 && !deleted && (
          <div
            className={cn(
              "mt-1.5 flex flex-wrap gap-1",
              message.mine && "justify-end"
            )}
          >
            {message.reactions!.map((r) => (
              <button
                key={r.emoji}
                type="button"
                disabled={busy}
                onClick={() => run(() => onReact(message.id, r.emoji))}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition",
                  r.mine
                    ? "border-brand/40 bg-brand/10 text-fg"
                    : "border-line bg-surface-muted text-fg-muted hover:border-brand/30"
                )}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {!deleted && (
          <div
            className={cn(
              "relative mt-1 flex flex-wrap items-center gap-1 transition-all duration-150",
              message.mine && "justify-end",
              menusOpen
                ? "pointer-events-auto max-h-12 opacity-100"
                : "pointer-events-none max-h-0 opacity-0 group-hover/msg:pointer-events-auto group-hover/msg:max-h-12 group-hover/msg:opacity-100 group-focus-within/msg:pointer-events-auto group-focus-within/msg:max-h-12 group-focus-within/msg:opacity-100"
            )}
          >
            <button
              type="button"
              disabled={busy}
              aria-label="React"
              aria-expanded={reactOpen}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-fg-muted shadow-sm transition hover:bg-surface-muted hover:text-fg",
                reactOpen && "border-brand/40 bg-brand/10 text-fg"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setReactOpen((v) => !v);
                setForwardOpen(false);
                setActionsPinned(true);
              }}
            >
              <SmilePlus className="h-3.5 w-3.5" />
              React
            </button>
            <button
              type="button"
              disabled={busy}
              aria-label="Forward"
              aria-expanded={forwardOpen}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-fg-muted shadow-sm transition hover:bg-surface-muted hover:text-fg",
                forwardOpen && "border-brand/40 bg-brand/10 text-fg"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setForwardOpen((v) => !v);
                setReactOpen(false);
                setActionsPinned(true);
              }}
            >
              <CornerUpRight className="h-3.5 w-3.5" />
              Forward
            </button>
            {message.mine && (
              <button
                type="button"
                disabled={busy}
                aria-label="Delete"
                className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-fg-muted shadow-sm transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setReactOpen(false);
                  setForwardOpen(false);
                  run(async () => {
                    await onDelete(message.id);
                    setActionsPinned(false);
                  });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}

            {reactOpen && (
              <div
                className={cn(
                  "absolute top-full z-30 mt-1 flex gap-1 rounded-full border border-line bg-card p-1 shadow-lg",
                  message.mine ? "right-0" : "left-0"
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={busy}
                    className="rounded-full px-1.5 py-1 text-base transition hover:scale-125 hover:bg-surface-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReactOpen(false);
                      run(() => onReact(message.id, emoji));
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {forwardOpen && (
              <div
                className={cn(
                  "absolute top-full z-30 mt-1 min-w-[11rem] overflow-hidden rounded-2xl border border-line bg-card py-1 shadow-lg",
                  message.mine ? "right-0" : "left-0"
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                  Forward to
                </p>
                {targets.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    disabled={busy}
                    className="block w-full px-3 py-2 text-left text-sm text-fg hover:bg-surface-muted disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForwardOpen(false);
                      run(async () => {
                        await onForward(message.id, channel);
                        setActionsPinned(false);
                      });
                    }}
                  >
                    {channel === "team" ? "Team Chat" : "Mentorship"}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
