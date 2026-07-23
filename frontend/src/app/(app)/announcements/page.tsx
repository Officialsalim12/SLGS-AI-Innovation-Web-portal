"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Megaphone } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form-fields";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Announcement = Awaited<
  ReturnType<typeof api.announcements>
>["announcements"][number];

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  async function load() {
    const res = await api.announcements();
    setItems(res.announcements);
  }

  useEffect(() => {
    setIsAdmin(getStoredUser()?.role === "ADMIN");
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load announcements"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function publish() {
    if (!title.trim() || !body.trim()) {
      toast("Title and message are required", "error");
      return;
    }
    setPosting(true);
    try {
      await api.createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        pinned,
        type: "update",
      });
      setTitle("");
      setBody("");
      setPinned(false);
      await load();
      toast("Announcement published", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not publish announcement",
        "error"
      );
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading announcements…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
        <p className="mt-2 text-xs text-fg-subtle">
          Sign in again if your session expired, then refresh this page.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PortalPageHeader
        title="Announcements"
        description={
          isAdmin
            ? "Post updates for all participants and mentors."
            : "Updates posted by administrators."
        }
      />

      {isAdmin && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">New announcement</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Only administrators can publish announcements.
            </p>
          </div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
          <Textarea
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write the announcement for the programme…"
          />
          <label className="flex items-center gap-3 text-sm text-fg">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 accent-purple"
            />
            Pin to top
          </label>
          <Button onClick={publish} loading={posting}>
            {posting ? "Publishing…" : "Publish announcement"}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-fg-muted">No announcements yet.</p>
        )}
        {items.map((a) => {
          const open = openId === a.id;
          return (
            <Card
              key={a.id}
              className={cn(
                "transition",
                a.unread && "border-purple/40 bg-purple/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-surface-muted p-2.5">
                  <Megaphone className="h-4 w-4 text-purple-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-medium text-fg">{a.title}</h2>
                    {a.unread && <Badge variant="purple">Unread</Badge>}
                    {a.pinned && <Badge variant="warning">Pinned</Badge>}
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {a.date}
                    </span>
                    <span>By {a.author}</span>
                  </p>
                  {open && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                      {a.body}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setOpenId(open ? null : a.id)}
                  >
                    {open ? "Show less" : "Read More"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
