"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatEmptyState, ChatShell } from "@/components/chat/chat-shell";
import { api, type ChatMessageDto } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { toast } from "@/components/ui/toast";

export function StaffChatPanel({
  title = "Judges & admins",
  subtitle = "Private channel between judges and administrators",
}: {
  title?: string;
  subtitle?: string;
}) {
  const myId = getStoredUser()?.id;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [members, setMembers] = useState<
    Array<{ id: string; name: string; title?: string | null; role?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await api.staffChat();
    setMessages(res.messages);
    if (res.members) setMembers(res.members);
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
        const res = await api.staffChat();
        if (cancelled) return;
        setMessages(res.messages);
        setMembers(res.members || []);
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
      const res = await api.postStaffChat(message.trim());
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

  if (loading) {
    return <PageLoader label="Loading staff chat…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <ChatShell
      channelLabel="Staff"
      title={title}
      subtitle={subtitle}
      members={members.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title || (m.role === "ADMIN" ? "Administrator" : "Judge"),
      }))}
      myId={myId}
      membersHeading="People"
      composerValue={message}
      onComposerChange={setMessage}
      onSend={send}
      sending={sending}
      placeholder="Message judges and admins…"
      empty={
        messages.length === 0 ? (
          <ChatEmptyState
            title="Start the conversation"
            description="Use this room for programme questions, scoring support, and admin–judge coordination."
          />
        ) : null
      }
    >
      {messages.map((m, index) => {
        const prev = messages[index - 1];
        const showMeta =
          !prev || prev.userId !== m.userId || prev.mine !== m.mine;
        return (
          <ChatMessageBubble
            key={m.id}
            message={m}
            currentChannel="team"
            showMeta={showMeta}
            forwardTargets={[]}
            onReact={react}
            onDelete={remove}
          />
        );
      })}
    </ChatShell>
  );
}
