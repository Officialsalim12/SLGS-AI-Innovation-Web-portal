"use client";

import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { api, type ChatMessageDto } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Member = NonNullable<
  Awaited<ReturnType<typeof api.myTeam>>["team"]
>["members"][number];

export default function TeamChatPage() {
  const myId = getStoredUser()?.id;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teamName, setTeamName] = useState("team");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await api.teamChat();
    setMessages(res.messages);
  }, []);

  function patchMessage(next: ChatMessageDto) {
    setMessages((list) => {
      const idx = list.findIndex((m) => m.id === next.id);
      if (idx === -1) return [...list, next];
      const copy = [...list];
      copy[idx] = next;
      return copy;
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [chat, teamRes] = await Promise.all([
          api.teamChat(),
          api.myTeam().catch(() => null),
        ]);
        if (cancelled) return;
        setMessages(chat.messages);
        if (teamRes?.team) {
          setMembers(teamRes.team.members);
          setTeamName(teamRes.team.name);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load chat");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (error) return;
    const id = setInterval(() => {
      loadMessages().catch(() => undefined);
    }, 5000);
    return () => clearInterval(id);
  }, [error, loadMessages]);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.postTeamChat(message.trim());
      setMessage("");
      patchMessage(res.message);
      await loadMessages();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send", "error");
    } finally {
      setSending(false);
    }
  };

  async function react(messageId: string, emoji: string) {
    try {
      const res = await api.reactChat(messageId, emoji);
      patchMessage(res.message);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not react", "error");
    }
  }

  async function remove(messageId: string) {
    try {
      const res = await api.deleteChatMessage(messageId);
      patchMessage(res.message);
      toast("Message deleted", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete", "error");
    }
  }

  async function forward(messageId: string, channel: "team" | "mentor") {
    try {
      const res = await api.forwardChat(messageId, channel);
      if (channel === "team") {
        patchMessage(res.message);
        await loadMessages();
        toast("Forwarded in Team Chat", "success");
      } else {
        toast("Forwarded — open Mentorship to see it", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not forward", "error");
    }
  }

  if (loading) {
    return <PageLoader label="Loading team chat…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  const otherMembers = members.filter((m) => m.id !== myId);

  return (
    <div className="flex h-[calc(100dvh-11.5rem)] min-w-0 overflow-hidden rounded-[16px] border border-line sm:rounded-[20px] lg:h-[calc(100dvh-7rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-card p-3 md:block">
        <p className="mb-1 px-2 text-[10px] uppercase tracking-wider text-fg-subtle">
          Team Chat
        </p>
        <p className="mb-4 truncate px-2 text-sm font-medium text-fg">
          #{teamName}
        </p>
        <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-fg-subtle">
          Members
        </p>
        <div className="space-y-1">
          {otherMembers.length === 0 && (
            <p className="px-2 text-xs text-fg-subtle">No other members yet</p>
          )}
          {otherMembers.map((m) => (
            <div
              key={m.id}
              className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-sm text-fg-muted"
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  m.online ? "bg-emerald" : "bg-fg-subtle"
                )}
              />
              <Avatar name={m.name} size="sm" />
              <span className="truncate">{m.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b border-line px-3 sm:px-4">
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">Team Chat</p>
            <p className="truncate text-xs text-fg-subtle">
              Only {teamName} members can see this
            </p>
          </div>
        </header>

        {otherMembers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2 scrollbar-thin md:hidden">
            {otherMembers.map((m) => (
              <div
                key={m.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs text-fg"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    m.online ? "bg-emerald" : "bg-fg-subtle"
                  )}
                />
                {m.name.split(" ")[0]}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-3 pb-8 scrollbar-thin sm:p-4">
          {messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              currentChannel="team"
              forwardTargets={["team", "mentor"]}
              onReact={react}
              onDelete={remove}
              onForward={forward}
            />
          ))}
        </div>

        <div className="border-t border-line p-3">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Message #${teamName}`}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-purple/50 sm:px-4"
            />
            <Button onClick={send} size="sm" loading={sending} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
