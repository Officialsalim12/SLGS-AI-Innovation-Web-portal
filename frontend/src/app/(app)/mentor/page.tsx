"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  MessageSquare,
  ClipboardCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  DashboardHero,
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-chrome";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type MentorOverview = {
  assignedTeams?: string[];
  totalTeams?: number;
  unreadMessages?: number;
  pendingReviews?: number;
};

type Programme = {
  name: string;
  venue: string;
  daysRemaining: number;
};

type MentorTeam = Awaited<ReturnType<typeof api.me>>["mentorTeams"][number];

export default function MentorDashboardPage() {
  const [name, setName] = useState(getStoredUser()?.name?.split(" ")[0] || "");
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [overview, setOverview] = useState<MentorOverview | null>(null);
  const [teams, setTeams] = useState<MentorTeam[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, me] = await Promise.all([
          api.dashboard() as Promise<{
            overview?: MentorOverview;
            programme?: Programme;
            user?: { name: string };
          }>,
          api.me(),
        ]);
        if (cancelled) return;
        setOverview(dash.overview || null);
        if (dash.programme) setProgramme(dash.programme);
        if (dash.user?.name || me.user?.name) {
          const full = dash.user?.name || me.user.name;
          setName(full.split(" ")[0] || full);
        }
        setTeams(me.mentorTeams || []);
        setSelected(me.mentorTeams?.[0]?.id || "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load mentor dashboard"
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

  const team = teams.find((t) => t.id === selected);

  const stats = [
    {
      label: "Assigned teams",
      value: overview?.totalTeams ?? teams.length,
      icon: Users,
      tone: "bg-emerald/15 text-emerald-light",
    },
    {
      label: "Unread messages",
      value: overview?.unreadMessages ?? "—",
      icon: MessageSquare,
      tone: "bg-blue/15 text-blue-light",
    },
    {
      label: "Pending reviews",
      value: overview?.pendingReviews ?? "—",
      icon: ClipboardCheck,
      tone: "bg-orange/15 text-orange-light",
    },
  ];

  if (loading) {
    return <PageLoader label="Loading dashboard…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      <DashboardHero
        name={name || "there"}
        title={programme?.name || "Mentor dashboard"}
        subtitle={
          programme
            ? `27 July – 21 August 2026 · ${programme.venue}`
            : "Review assigned teams and share feedback"
        }
        daysRemaining={programme?.daysRemaining}
        meta={[
          {
            label: "Teams",
            value: (
              <span className="text-brand">
                {overview?.totalTeams ?? teams.length}
              </span>
            ),
          },
          {
            label: "Focus",
            value: team?.name || "No team selected",
            hint:
              overview?.pendingReviews != null
                ? `${overview.pendingReviews} pending review${
                    overview.pendingReviews === 1 ? "" : "s"
                  }`
                : undefined,
          },
        ]}
      />

      <DashboardStatGrid title="Overview" description="Your mentoring workload">
        {stats.map((s, i) => (
          <DashboardStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            tone={s.tone}
            delay={0.06 + i * 0.03}
          />
        ))}
      </DashboardStatGrid>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-6"
      >
        <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <h3 className="font-display text-base font-semibold text-fg">
            Assigned teams
          </h3>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
            {teams.length === 0 && (
              <p className="text-sm text-fg-muted">
                No teams assigned yet. Ask an administrator to assign you from
                Assign Mentors.
              </p>
            )}
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition lg:w-full",
                  selected === t.id
                    ? "bg-brand/10 text-fg ring-1 ring-brand/25"
                    : "bg-surface-muted text-fg-muted hover:bg-surface-hover lg:bg-transparent"
                )}
              >
                <span className="truncate">{t.name}</span>
                <FolderKanban className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            ))}
          </div>
        </Card>

        <Card className="min-w-0 border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          {team ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display break-words text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                    {team.name}
                  </h2>
                  <p className="mt-1 text-sm text-fg-muted">
                    {team.submissions} submission
                    {team.submissions === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant="purple">Assigned</Badge>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                  Members
                </p>
                <ul className="mt-2 space-y-1 text-sm text-fg-muted">
                  {team.members.map((m) => (
                    <li key={m} className="break-words">
                      {m}
                    </li>
                  ))}
                  {team.members.length === 0 && (
                    <li>No members on this team yet</li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/mentor/reviews", label: "Review files" },
                  { href: "/mentor-chat", label: "Mentor chat" },
                  { href: "/leaderboard", label: "Leaderboard" },
                  { href: "/announcements", label: "Announcements" },
                ].map((a) => (
                  <Link key={a.href + a.label} href={a.href}>
                    <Button variant="outline" size="sm">
                      {a.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-fg-muted">
              {teams.length === 0
                ? "Once an admin assigns you to a team, it will appear here."
                : "Select a team to supervise."}
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
