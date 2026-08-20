"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatEmptyState, ChatShell } from "@/components/chat/chat-shell";
import { api, type ChatMessageDto } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Mentor = NonNullable<
  Awaited<ReturnType<typeof api.mentorChat>>["mentors"]
>[number];
type Member = NonNullable<
  Awaited<ReturnType<typeof api.mentorChat>>["members"]
>[number];
type MentorTeam = Awaited<ReturnType<typeof api.me>>["mentorTeams"][number];

export default function MentorChatPage() {
  const me = getStoredUser();
  const role = me?.role;
  const isMentor = role === "MENTOR";
  const myId = me?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignedTeams, setAssignedTeams] = useState<MentorTeam[]>([]);
  const [teamId, setTeamId] = useState<string | undefined>(undefined);
  const [teamName, setTeamName] = useState("Team");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async (activeTeamId?: string) => {
    const res = await api.mentorChat(activeTeamId);
    setMessages(res.messages);
    if (res.teamId) setTeamId(res.teamId);
    if (res.teamName) setTeamName(res.teamName);
    if (res.mentors) setMentors(res.mentors);
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
        let preferredTeamId: string | undefined;
        if (isMentor) {
          const profile = await api.me();
          if (cancelled) return;
          setAssignedTeams(profile.mentorTeams || []);
          preferredTeamId = profile.mentorTeams?.[0]?.id;
          if (!preferredTeamId) {
            setError("No teams assigned yet. Ask an admin to assign you.");
            return;
          }
        }
        await loadMessages(preferredTeamId);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load mentor chat"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMentor, loadMessages]);

  useEffect(() => {
    if (error || loading) return;
    const id = setInterval(() => {
      loadMessages(teamId).catch(() => undefined);
    }, 5000);
    return () => clearInterval(id);
  }, [error, loading, loadMessages, teamId]);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.postMentorChat(message.trim(), teamId);
      setMessage("");
      patchMessage(res.message);
      await loadMessages(teamId);
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
      if (channel === "mentor") {
        patchMessage(res.message);
        await loadMessages(teamId);
        toast("Forwarded in Mentorship", "success");
      } else {
        toast("Forwarded — open Team Chat to see it", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not forward", "error");
    }
  }

  if (loading) {
    return <PageLoader label="Loading mentor chat…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  const sidebarPeople = (isMentor ? members : mentors).filter(
    (person) => person.id !== myId
  );
  const forwardTargets: Array<"team" | "mentor"> = isMentor
    ? ["mentor"]
    : ["team", "mentor"];

  return (
    <ChatShell
      channelLabel="Mentorship"
      title={teamName}
      subtitle="Only this team and its mentors can read these messages"
      members={sidebarPeople.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title || (isMentor ? "Participant" : "Mentor"),
      }))}
      myId={myId}
      membersHeading={isMentor ? "Participants" : "Mentors"}
      composerValue={message}
      onComposerChange={setMessage}
      onSend={send}
      sending={sending}
      placeholder={isMentor ? "Message the team…" : "Message your mentors…"}
      sidebarExtra={
        isMentor && assignedTeams.length > 1 ? (
          <div className="space-y-1">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              Switch team
            </p>
            {assignedTeams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={async () => {
                  setTeamId(t.id);
                  setLoading(true);
                  try {
                    await loadMessages(t.id);
                    setError("");
                  } catch (err) {
                    toast(
                      err instanceof Error
                        ? err.message
                        : "Could not switch team",
                      "error"
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  teamId === t.id
                    ? "bg-brand/12 font-medium text-fg ring-1 ring-brand/25"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        ) : null
      }
      empty={
        messages.length === 0 ? (
          <ChatEmptyState
            title="No messages yet"
            description={
              isMentor
                ? "Send guidance, feedback, or check-ins to this team."
                : "Ask your mentors questions or share progress updates."
            }
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
            currentChannel="mentor"
            compact
            showMeta={showMeta}
            forwardTargets={forwardTargets}
            onReact={react}
            onDelete={remove}
            onForward={forward}
          />
        );
      })}
    </ChatShell>
  );
}
