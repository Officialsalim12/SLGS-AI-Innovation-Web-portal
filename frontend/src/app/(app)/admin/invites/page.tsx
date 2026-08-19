"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Trash2 } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { PageLoader } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

type StaffPayload = Awaited<ReturnType<typeof api.adminStaff>>;
type InviteRow = StaffPayload["invites"][number];
type StaffRole = "ADMIN" | "JUDGE";

const selectClass =
  "h-11 w-full rounded-2xl border border-line bg-input px-4 text-sm text-fg outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminInvitesPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("JUDGE");
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [admins, setAdmins] = useState<StaffPayload["admins"]>([]);
  const [judges, setJudges] = useState<StaffPayload["judges"]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await api.adminStaff();
    setInvites(res.invites);
    setAdmins(res.admins);
    setJudges(res.judges);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load invitations"
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

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast("Enter an email address", "error");
      return;
    }
    setSending(true);
    try {
      const res = await api.inviteStaff({
        email: email.trim(),
        role,
        name: name.trim() || undefined,
      });
      await load();
      setEmail("");
      setName("");
      toast(res.message || "Invitation sent", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not send invitation",
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  async function resend(id: string) {
    setBusyId(id);
    try {
      const res = await api.resendInvite(id);
      await load();
      toast(res.message || "Invitation resent", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not resend invitation",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function revoke(id: string) {
    setBusyId(id);
    try {
      await api.revokeInvite(id);
      await load();
      toast("Invitation removed", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not remove invitation",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <PageLoader label="Loading invitations…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Invite staff"
        description="Send an email so someone can complete signup as a judge or administrator."
      />

      <Card>
        <CardHeader
          title="Send invitation"
          description="They receive a link by email, set a password, and land on their dashboard."
        />
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={sendInvite}>
          <Input
            id="invite-email"
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="invite-name"
            label="Name (optional)"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="space-y-1.5">
            <label htmlFor="invite-role" className="block text-sm font-medium text-fg-muted">
              Role
            </label>
            <select
              id="invite-role"
              className={selectClass}
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              <option value="JUDGE">Judge</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={sending} className="w-full sm:w-auto">
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Invitations"
          description="Pending until they finish signup, then marked Complete. You can delete a completed invitation without removing their account."
        />
        <div className="mt-4 space-y-2">
          {invites.length === 0 && (
            <p className="text-sm text-fg-muted">No invitations yet.</p>
          )}
          {[...invites]
            .sort((a, b) => {
              const aDone = Boolean(a.acceptedAt);
              const bDone = Boolean(b.acceptedAt);
              if (aDone !== bDone) return aDone ? 1 : -1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((invite) => {
            const complete = Boolean(invite.acceptedAt);
            return (
            <div
              key={invite.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-muted/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-fg">
                    {invite.name || invite.email}
                  </p>
                  <Badge variant={complete ? "success" : "warning"}>
                    {complete ? "Complete" : "Pending"}
                  </Badge>
                  <Badge variant="blue">
                    {invite.role === "ADMIN" ? "Administrator" : "Judge"}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-fg-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {invite.email}
                </p>
                <p className="mt-1 text-xs text-fg-subtle">
                  Invited {formatDate(invite.createdAt)}
                  {invite.invitedBy ? ` by ${invite.invitedBy.name}` : ""}
                  {complete
                    ? ` · completed ${formatDate(invite.acceptedAt as string)}`
                    : ` · expires ${formatDate(invite.expiresAt)}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!complete && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    loading={busyId === invite.id}
                    onClick={() => resend(invite.id)}
                  >
                    Resend
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  loading={busyId === invite.id}
                  onClick={() => revoke(invite.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {complete ? "Delete" : "Revoke"}
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Administrators (${admins.length})`} />
          <div className="mt-3 space-y-2">
            {admins.length === 0 && (
              <p className="text-sm text-fg-muted">No administrators yet.</p>
            )}
            {admins.map((person) => (
              <div
                key={person.id}
                className="rounded-xl border border-line bg-surface-muted/80 px-4 py-3"
              >
                <p className="font-medium text-fg">{person.name}</p>
                <p className="truncate text-sm text-fg-muted">{person.email}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title={`Judges (${judges.length})`} />
          <div className="mt-3 space-y-2">
            {judges.length === 0 && (
              <p className="text-sm text-fg-muted">No judges yet.</p>
            )}
            {judges.map((person) => (
              <div
                key={person.id}
                className="rounded-xl border border-line bg-surface-muted/80 px-4 py-3"
              >
                <p className="font-medium text-fg">{person.name}</p>
                <p className="truncate text-sm text-fg-muted">{person.email}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
