"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Avatar } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form-fields";
import { api } from "@/lib/api";
import {
  dashboardForRole,
  getToken,
  roleLabel,
  saveSession,
  type AuthRole,
  type AuthUser,
} from "@/lib/auth";
import { toast } from "@/components/ui/toast";
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
} from "@/lib/notification-prefs";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const participantNotifications = [
  "New announcements",
  "Mentor comments",
  "New chat messages",
  "Task assignments",
  "Kanban updates",
  "Submission deadlines",
  "Leaderboard updates",
];

const mentorNotifications = [
  "Unread team messages",
  "Pending submission reviews",
  "Team milestone updates",
  "Admin announcements",
  "Meeting reminders",
];

const adminNotifications = [
  "New registrations",
  "Pending submissions",
  "Team lock status changes",
  "Leaderboard publish confirmations",
  "System alerts",
];

const judgeNotifications = [
  "Pending submissions",
  "Admin announcements",
  "Leaderboard updates",
];

function notificationsForRole(role: AuthRole | null) {
  if (role === "ADMIN") return adminNotifications;
  if (role === "MENTOR") return mentorNotifications;
  if (role === "JUDGE") return judgeNotifications;
  return participantNotifications;
}

type Mentor = {
  id: string;
  name: string;
  title?: string | null;
};

export default function SettingsPage() {
  const [role, setRole] = useState<AuthRole | null>("PARTICIPANT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [team, setTeam] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorTeams, setMentorTeams] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.me();
        if (cancelled) return;
        const user = res.user;
        setRole(user.role);
        setName(user.name);
        setEmail(user.email);
        setTitle(user.title || "");
        setBio(user.bio || "");
        if (user.role === "ADMIN" || user.role === "JUDGE") setTeam("—");
        else if (user.role === "MENTOR") {
          const names = (res.mentorTeams || []).map((t) => t.name);
          setMentorTeams(names);
          setTeam(
            names.length === 0
              ? "No teams assigned"
              : names.length === 1
                ? names[0]
                : `${names.length} teams`
          );
        } else setTeam(res.team?.name || "Unassigned");
        setMentors(res.team?.mentors || []);
        const labels = notificationsForRole(user.role);
        const fromServer =
          user.notificationPrefs &&
          typeof user.notificationPrefs === "object"
            ? user.notificationPrefs
            : null;
        const stored = fromServer || loadNotificationPrefs();
        setPrefs(
          Object.fromEntries(labels.map((l) => [l, stored?.[l] ?? true]))
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load profile"
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

  const notificationLabels = notificationsForRole(role);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = (await api.updateProfile({
        name,
        title,
        bio,
      })) as { user?: AuthUser };
      if (res.user) {
        const token = getToken();
        if (token) saveSession(token, res.user);
      }
      toast("Profile updated", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSavingPrefs(true);
    try {
      const res = (await api.updateProfile({
        name,
        title,
        bio,
        notificationPrefs: prefs,
      })) as { user?: AuthUser };
      if (res.user) {
        const token = getToken();
        if (token) saveSession(token, res.user);
        saveNotificationPrefs(
          (res.user.notificationPrefs as Record<string, boolean>) || prefs
        );
      } else {
        saveNotificationPrefs(prefs);
      }
      toast("Notification preferences saved", "success");
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Could not save notification preferences",
        "error"
      );
    } finally {
      setSavingPrefs(false);
    }
  }

  const displayRole = roleLabel(role);

  if (loading) {
    return <PageLoader label="Loading settings…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div {...fade} className="space-y-4">
        <Link
          href={role ? dashboardForRole(role) : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <PortalPageHeader
          title="Settings"
          description="Manage your profile and notification preferences."
        />
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.04 }}>
        <Card className="relative overflow-hidden">
          <div className="blob absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple opacity-20" />
          <div className="relative flex items-center gap-4">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-fg">{name}</h2>
                <Badge variant="purple">{displayRole}</Badge>
              </div>
              <p className="mt-1 truncate text-sm text-fg-muted">{email}</p>
              {role === "PARTICIPANT" && (
                <p className="mt-1 text-sm text-purple-light">
                  Team · {team}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.08 }}>
        <Card>
          <CardHeader
            title="Profile"
            description="Same details collected on first login"
          />
          <div className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input label="Email" value={email} disabled />
            <Input
              label={role === "PARTICIPANT" ? "Role on team" : "Title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                role === "PARTICIPANT"
                  ? "Frontend Developer"
                  : role === "MENTOR"
                    ? "Lead Mentor"
                    : role === "JUDGE"
                      ? "Judge"
                      : "Administrator"
              }
            />
            {role === "PARTICIPANT" && (
              <Input label="Team" value={team} disabled />
            )}
            <Textarea
              label="Short bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="What are you building or mentoring?"
            />
            <Button onClick={saveProfile} loading={saving}>
              Save profile
            </Button>
          </div>
        </Card>
      </motion.div>

      {role === "PARTICIPANT" && (
        <motion.div {...fade} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader
              title="Assigned mentors"
              description="Managed by administrators"
            />
            <div className="space-y-3">
              {mentors.length === 0 && (
                <p className="text-sm text-fg-muted">No mentors assigned yet.</p>
              )}
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3"
                >
                  <Avatar name={m.name} />
                  <div>
                    <p className="text-sm font-medium text-fg">{m.name}</p>
                    <p className="text-xs text-fg-subtle">{m.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {role === "MENTOR" && (
        <motion.div {...fade} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader
              title="Assigned teams"
              description="Managed by administrators"
            />
            <div className="space-y-2">
              {mentorTeams.length === 0 && (
                <p className="text-sm text-fg-muted">
                  No teams assigned yet. Ask an admin to assign you from Assign
                  Mentors.
                </p>
              )}
              {mentorTeams.map((teamName) => (
                <div
                  key={teamName}
                  className="rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-fg"
                >
                  {teamName}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div {...fade} transition={{ delay: 0.12 }}>
        <Card>
          <CardHeader
            title="Notifications"
            description="Real-time alerts for your role"
          />
          <div className="space-y-3">
            {notificationLabels.map((label) => (
              <label
                key={label}
                className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg-muted"
              >
                {label}
                <input
                  type="checkbox"
                  checked={prefs[label] ?? true}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, [label]: e.target.checked }))
                  }
                  className="accent-purple"
                />
              </label>
            ))}
          </div>
          <Button
            className="mt-4"
            variant="outline"
            onClick={saveNotifications}
            loading={savingPrefs}
          >
            {savingPrefs ? "Saving…" : "Save notifications"}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
