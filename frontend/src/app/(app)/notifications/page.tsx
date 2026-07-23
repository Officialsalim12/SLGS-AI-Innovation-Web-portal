"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  Clock3,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { InlineLoader, PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const categoryIcon: Record<string, typeof Bell> = {
  announcement: Megaphone,
  mentor: GraduationCap,
  chat: MessageSquare,
  task: ClipboardList,
  deadline: Clock3,
  leaderboard: Trophy,
};

const categoryLabel: Record<string, string> = {
  announcement: "Announcement",
  mentor: "Mentor",
  chat: "Chat",
  task: "Task",
  deadline: "Deadline",
  leaderboard: "Leaderboard",
};

type Notif = Awaited<ReturnType<typeof api.notifications>>["notifications"][number];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [clearingAll, setClearingAll] = useState(false);
  const [clearingId, setClearingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.notifications();
      setItems(res.notifications);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const unread = items.filter((n) => n.unread).length;
  const visible = filter === "unread" ? items.filter((n) => n.unread) : items;

  async function clearOne(id: string, e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (clearingId) return;
    setClearingId(id);
    try {
      await api.clearNotifications({ id });
      setItems((prev) => prev.filter((n) => n.id !== id));
      toast("Notification cleared", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not clear notification",
        "error"
      );
    } finally {
      setClearingId(null);
    }
  }

  async function clearAll() {
    if (clearingAll || items.length === 0) return;
    const confirmed = window.confirm(
      "Clear all notifications? This cannot be undone."
    );
    if (!confirmed) return;
    setClearingAll(true);
    try {
      const res = await api.clearNotifications();
      setItems([]);
      toast(
        res.cleared === 1
          ? "1 notification cleared"
          : `${res.cleared} notifications cleared`,
        "success"
      );
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not clear notifications",
        "error"
      );
    } finally {
      setClearingAll(false);
    }
  }

  if (loading && items.length === 0) {
    return <PageLoader label="Loading notifications…" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Updates for announcements, mentor comments, chat, tasks, and scores.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0}
            onClick={async () => {
              try {
                await api.readNotifications();
                setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
                toast("All notifications marked as read", "success");
              } catch (err) {
                toast(
                  err instanceof Error ? err.message : "Could not update",
                  "error"
                );
              }
            }}
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            loading={clearingAll}
            onClick={clearAll}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {clearingAll ? "Clearing…" : "Clear all"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
              filter === f
                ? "bg-brand/15 text-brand"
                : "bg-surface-muted text-fg-muted hover:text-fg"
            )}
          >
            {f}
            {f === "unread" ? ` (${unread})` : ""}
          </button>
        ))}
      </div>

      <Card className="space-y-0 overflow-hidden p-0">
        <div className="border-b border-line px-5 py-4">
          <CardHeader
            title="Inbox"
            description={
              loading
                ? "Refreshing…"
                : `${visible.length} notification${visible.length === 1 ? "" : "s"}`
            }
            className="mb-0"
          />
        </div>

        {loading && items.length > 0 ? (
          <div className="px-5 py-8">
            <InlineLoader label="Refreshing notifications…" />
          </div>
        ) : !loading && visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-fg-subtle">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-sm text-fg-muted">No notifications.</p>
          </div>
        ) : (
          <div>
            {visible.map((n) => {
              const Icon = categoryIcon[n.category] || Bell;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 border-b border-line px-5 py-4 transition last:border-b-0 hover:bg-surface-muted",
                    n.unread && "bg-brand-soft/30"
                  )}
                >
                  <Link
                    href={n.href}
                    onClick={async () => {
                      await api.readNotifications({ id: n.id });
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === n.id ? { ...x, unread: false } : x
                        )
                      );
                    }}
                    className="flex min-w-0 flex-1 gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-fg">{n.title}</p>
                        <Badge variant="muted">
                          {categoryLabel[n.category] || n.category}
                        </Badge>
                        {n.unread && <Badge variant="purple">Unread</Badge>}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                        {n.text}
                      </p>
                      <p className="mt-2 text-xs text-fg-subtle">{n.time} ago</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-label="Clear notification"
                    disabled={clearingId === n.id}
                    onClick={(e) => clearOne(n.id, e)}
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-subtle transition hover:bg-surface-hover hover:text-fg disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
