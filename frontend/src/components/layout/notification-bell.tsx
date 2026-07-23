"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  MessageSquare,
  Megaphone,
  GraduationCap,
  Trophy,
  Clock3,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const categoryIcon: Record<string, typeof Bell> = {
  announcement: Megaphone,
  mentor: GraduationCap,
  chat: MessageSquare,
  task: ClipboardList,
  deadline: Clock3,
  leaderboard: Trophy,
};

type Notif = Awaited<ReturnType<typeof api.notifications>>["notifications"][number];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => n.unread).length;

  async function load() {
    try {
      const res = await api.notifications();
      setItems(res.notifications);
    } catch {
      /* logged out */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function markAllRead() {
    await api.readNotifications();
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          load();
        }}
        className="relative rounded-xl p-2 text-fg-muted hover:bg-surface-muted hover:text-fg"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-1.5rem),22rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-line bg-card shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg">Notifications</p>
              <p className="text-xs text-fg-subtle">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="shrink-0 text-xs font-medium text-brand hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {items.slice(0, 5).map((n) => {
              const Icon = categoryIcon[n.category] || Bell;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={async () => {
                    await api.readNotifications({ id: n.id });
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === n.id ? { ...x, unread: false } : x
                      )
                    );
                    setOpen(false);
                  }}
                  className={cn(
                    "flex gap-3 border-b border-line px-4 py-3 transition hover:bg-surface-muted",
                    n.unread && "bg-brand-soft/40"
                  )}
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-fg">
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-fg-subtle">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                      {n.text}
                    </p>
                  </div>
                </Link>
              );
            })}
            {!items.length && (
              <p className="px-4 py-8 text-center text-sm text-fg-muted">
                No notifications yet.
              </p>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-medium text-brand hover:bg-surface-muted"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
