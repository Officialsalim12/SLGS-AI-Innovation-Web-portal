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
  const otherMentors = mentors.filter((m) => m.id !== myId);
  const otherMembers = members.filter((m) => m.id !== myId);
  const forwardTargets: Array<"team" | "mentor"> = isMentor
    ? ["mentor"]
    : ["team", "mentor"];

  return (
    <div className="flex h-[calc(100dvh-11.5rem)] min-w-0 overflow-hidden rounded-[16px] border border-line sm:rounded-[20px] lg:h-[calc(100dvh-7rem)]">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-card p-4 md:block">
        <p className="text-[10px] uppercase tracking-wider text-fg-subtle">
          Mentorship
        </p>
        <p className="mt-1 truncate text-sm font-medium text-fg">
          {teamName}
        </p>
        <p className="mt-1 text-xs text-fg-muted">
          Only this team and its mentors can read these messages.
        </p>

        {isMentor && assignedTeams.length > 1 && (
          <div className="mt-4 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-fg-subtle">
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
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  teamId === t.id
                    ? "bg-brand/10 text-fg"
                    : "text-fg-muted hover:bg-surface-muted"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle">
            {isMentor ? "Participants" : "Mentors"}
          </p>
          {sidebarPeople.length === 0 && (
            <p className="text-xs text-fg-subtle">
              {isMentor
                ? "No participants on this team yet"
                : "No mentors assigned yet"}
            </p>
          )}
          {sidebarPeople.map((person) => (
            <div key={person.id} className="flex items-center gap-2">
              <Avatar name={person.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{person.name}</p>
                {person.title ? (
                  <p className="truncate text-[11px] text-fg-subtle">
                    {person.title}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-canvas">
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <p className="truncate text-sm font-semibold text-fg">
            Mentorship · {teamName}
          </p>
          {!isMentor && otherMentors.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-fg-muted">
              Mentors: {otherMentors.map((m) => m.name).join(", ")}
            </p>
          )}
          {isMentor && otherMembers.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-fg-muted">
              {otherMembers.length} participant
              {otherMembers.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 pb-10 sm:p-5">
          {messages.length === 0 && (
            <p className="text-sm text-fg-muted">
              No messages yet. Start the conversation.
            </p>
          )}
          {messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              currentChannel="mentor"
              compact
              forwardTargets={forwardTargets}
              onReact={react}
              onDelete={remove}
              onForward={forward}
            />
          ))}
        </div>

        <div className="border-t border-line p-3 sm:p-4">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                isMentor ? "Message the team…" : "Message your mentors…"
              }
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand/50 sm:px-4"
            />
            <Button
              onClick={send}
              size="sm"
              loading={sending}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
