"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardCheck,
  Gavel,
  Newspaper,
  Trophy,
  Upload,
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
import { dashboardForRole, getStoredUser } from "@/lib/auth";

type Overview = {
  projectsSubmitted?: number;
  pendingReviews?: number;
  scoredByMe?: number;
  announcements?: number;
};

type Programme = {
  name: string;
  venue: string;
  daysRemaining: number;
};

export default function JudgeDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState(getStoredUser()?.name?.split(" ")[0] || "");
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.role !== "JUDGE") {
      router.replace(dashboardForRole(user.role));
      return;
    }
    if (!user || user.role !== "JUDGE") {
      setError("Judge access required.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const dash = (await api.dashboard()) as {
          programme?: Programme;
          overview?: Overview;
          user?: { name: string };
        };
        if (cancelled) return;
        if (dash.programme) setProgramme(dash.programme);
        if (dash.overview) setOverview(dash.overview);
        if (dash.user?.name) {
          setName(dash.user.name.split(" ")[0] || dash.user.name);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load judge dashboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const stats = [
    {
      label: "Projects submitted",
      value: overview?.projectsSubmitted ?? "—",
      icon: Upload,
      tone: "bg-blue/15 text-blue-light",
    },
    {
      label: "Pending reviews",
      value: overview?.pendingReviews ?? "—",
      icon: ClipboardCheck,
      tone: "bg-orange/15 text-orange-light",
    },
    {
      label: "Scored by you",
      value: overview?.scoredByMe ?? "—",
      icon: Gavel,
      tone: "bg-purple/15 text-purple-light",
    },
    {
      label: "Announcements",
      value: overview?.announcements ?? "—",
      icon: Newspaper,
      tone: "bg-emerald/15 text-emerald-light",
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
        title={programme?.name || "Judge dashboard"}
        subtitle={
          programme
            ? `27 July – 20 August 2026 · ${programme.venue}`
            : "Score submitted projects"
        }
        daysRemaining={programme?.daysRemaining}
        meta={[
          {
            label: "Pending",
            value: (
              <span className="text-brand">
                {overview?.pendingReviews ?? "—"}
              </span>
            ),
            hint: "Projects waiting for a score",
          },
          {
            label: "Your scores",
            value: overview?.scoredByMe ?? "—",
          },
        ]}
      />

      <DashboardStatGrid
        title="Overview"
        description="Judging workload across submitted projects"
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
        className="grid gap-4 lg:grid-cols-2 lg:gap-6"
      >
        <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <h3 className="font-display text-base font-semibold text-fg">
            Score projects
          </h3>
          <p className="mt-2 text-sm text-fg-muted">
            Open team files and score them with SMART: Specific, Measurable,
            Achievable, Relevant, and Time-bound.
          </p>
          <Link href="/judge/reviews" className="mt-4 inline-block">
            <Button size="sm">
              Open scoring
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
        <Card className="border border-line/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <h3 className="font-display text-base font-semibold text-fg">
            Leaderboard
          </h3>
          <p className="mt-2 text-sm text-fg-muted">
            Team ranking uses the average of published judge scores.
          </p>
          <Link href="/leaderboard" className="mt-4 inline-block">
            <Button size="sm" variant="outline">
              View leaderboard
              <Trophy className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
