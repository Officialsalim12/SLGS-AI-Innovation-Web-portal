"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Megaphone,
  Upload,
  FolderKanban,
  Clock,
  ArrowRight,
  UserRound,
  BarChart3,
} from "lucide-react";
import {
  DashboardHero,
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-chrome";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

const modules = [
  { href: "/admin/participants", label: "Participants", icon: UserRound },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/mentors", label: "Assign Mentors", icon: GraduationCap },
  { href: "/announcements", label: "Post Announcement", icon: Megaphone },
  { href: "/leaderboard", label: "Setup Leaderboard", icon: BarChart3 },
  { href: "/admin/submissions", label: "Project Reviews", icon: Upload },
];

type Overview = {
  participants: number;
  teams: number;
  mentors: number;
  announcements: number;
  projectsSubmitted: number;
  pendingSubmissions: number;
};

type Programme = {
  name: string;
  venue: string;
  daysRemaining: number;
};

type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];

export default function AdminDashboardPage() {
  const [name, setName] = useState(getStoredUser()?.name?.split(" ")[0] || "");
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = getStoredUser()?.role;
    if (role !== "ADMIN") {
      setError("Admin access required.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [dash, teamsRes] = await Promise.all([
          api.dashboard() as Promise<{
            programme?: Programme & {
              theme?: string;
              welcomeLine?: string;
              challengeTrack?: string;
            };
            overview?: Overview;
            user?: { name: string };
          }>,
          api.teams(),
        ]);
        if (cancelled) return;
        if (dash.programme) setProgramme(dash.programme);
        if (dash.overview) setOverview(dash.overview);
        if (dash.user?.name) setName(dash.user.name.split(" ")[0] || dash.user.name);
        setTeams(teamsRes.teams);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load admin dashboard"
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

  const stats = [
    {
      label: "Participants",
      value: overview?.participants ?? "—",
      icon: Users,
      tone: "bg-emerald/15 text-emerald-light",
    },
    {
      label: "Teams",
      value: overview?.teams ?? "—",
      icon: FolderKanban,
      tone: "bg-blue/15 text-blue-light",
    },
    {
      label: "Mentors",
      value: overview?.mentors ?? "—",
      icon: GraduationCap,
      tone: "bg-purple/15 text-purple-light",
    },
    {
      label: "Announcements",
      value: overview?.announcements ?? "—",
      icon: Megaphone,
      tone: "bg-orange/15 text-orange-light",
    },
    {
      label: "Projects submitted",
      value: overview?.projectsSubmitted ?? "—",
      icon: Upload,
      tone: "bg-blue/15 text-blue-light",
    },
    {
      label: "Pending reviews",
      value: overview?.pendingSubmissions ?? "—",
      icon: Clock,
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
        title={programme?.name || "Programme dashboard"}
        subtitle={
          programme
            ? `27 July – 21 August 2026 · ${programme.venue}`
            : undefined
        }
        daysRemaining={programme?.daysRemaining}
        meta={[
          {
            label: "Participants",
            value: (
              <span className="text-brand">
                {overview?.participants ?? "—"}
              </span>
            ),
          },
          {
            label: "Active teams",
            value: overview?.teams ?? "—",
            hint: `${overview?.pendingSubmissions ?? 0} pending review${
              (overview?.pendingSubmissions ?? 0) === 1 ? "" : "s"
            }`,
          },
        ]}
      />

      <DashboardStatGrid
        title="Overview"
        description="Programme activity across the portal"
      >
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
      >
        <h2 className="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.label} href={m.href} className="min-w-0">
              <div className="group flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-card/80 px-4 py-3.5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] transition hover:border-brand/30 hover:bg-surface-hover">
                <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-fg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <m.icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{m.label}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <h3 className="font-display text-base font-semibold text-fg">
            Assign mentors
          </h3>
          <p className="mt-2 text-sm text-fg-muted">
            Link mentors to teams so they can review work and chat with members.
          </p>
          <Link href="/admin/mentors" className="mt-4 inline-block">
            <Button size="sm">
              Assign mentors
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
        <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <h3 className="font-display text-base font-semibold text-fg">
            Team management
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>Create teams and place participants</li>
            <li>Lock teams after the event starts</li>
            <li>Publish announcements and scores</li>
          </ul>
          <Link href="/admin/teams" className="mt-4 inline-block">
            <Button size="sm">
              Manage teams
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <h3 className="font-display text-base font-semibold text-fg">
          Active teams
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {teams.length === 0 && (
            <p className="text-sm text-fg-muted">No teams yet.</p>
          )}
          {teams.map((t) => (
            <div
              key={t.id}
              className="min-w-0 rounded-2xl border border-line bg-surface-muted/80 px-4 py-3.5"
            >
              <p className="truncate font-medium text-fg">{t.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-fg-subtle">
                Mentors: {t.mentors.length ? t.mentors.join(", ") : "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
