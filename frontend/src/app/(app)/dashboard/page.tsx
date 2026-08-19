"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  ChartNoAxesCombined,
  ClipboardList,
  FolderUp,
  ListChecks,
  Newspaper,
} from "lucide-react";
import {
  DashboardHero,
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-chrome";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { dashboardForRole, getStoredUser } from "@/lib/auth";

type DashData = {
  user?: { name: string };
  programme?: {
    name: string;
    theme: string;
    venue: string;
    welcomeLine: string;
    challengeTrack: string;
    daysRemaining: number;
    endDate?: string;
  };
  team?: string | null;
  mentors?: Array<{ name: string; title?: string | null }>;
  stats?: {
    tasksCompleted: number;
    pendingTasks: number;
    announcements: number;
    filesSubmitted: number;
    currentRank: number | null;
    projectProgress: number;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState(getStoredUser()?.name?.split(" ")[0] || "");
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && stored.role !== "PARTICIPANT") {
      router.replace(dashboardForRole(stored.role));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = (await api.dashboard()) as DashData;
        if (cancelled) return;
        setData(res);
        if (res.user?.name) setName(res.user.name.split(" ")[0] || res.user.name);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load dashboard");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!data && !error) {
    return <PageLoader label="Loading dashboard…" />;
  }

  const stats = [
    {
      label: "Tasks completed",
      value: data?.stats?.tasksCompleted ?? "—",
      icon: ListChecks,
      tone: "bg-emerald/15 text-emerald-light",
    },
    {
      label: "Pending tasks",
      value: data?.stats?.pendingTasks ?? "—",
      icon: ClipboardList,
      tone: "bg-orange/15 text-orange-light",
    },
    {
      label: "Announcements",
      value: data?.stats?.announcements ?? "—",
      icon: Newspaper,
      tone: "bg-blue/15 text-blue-light",
    },
    {
      label: "Files submitted",
      value: data?.stats?.filesSubmitted ?? "—",
      icon: FolderUp,
      tone: "bg-purple/15 text-purple-light",
    },
    {
      label: "Current rank",
      value: data?.stats?.currentRank ? `#${data.stats.currentRank}` : "—",
      icon: Award,
      tone: "bg-orange/15 text-orange-light",
    },
    {
      label: "Project progress",
      value:
        data?.stats?.projectProgress != null
          ? `${data.stats.projectProgress}%`
          : "—",
      icon: ChartNoAxesCombined,
      tone: "bg-emerald/15 text-emerald-light",
    },
  ];

  return (
    <div className="space-y-7 sm:space-y-8">
      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <DashboardHero
        name={name || "there"}
        title={data?.programme?.name || "Your dashboard"}
        subtitle={
          data?.programme
            ? `27 July – 20 August 2026 · ${data.programme.venue}`
            : undefined
        }
        daysRemaining={data?.programme?.daysRemaining}
        meta={[
          {
            label: "Team",
            value: (
              <span className="text-brand">{data?.team || "Unassigned"}</span>
            ),
          },
          {
            label: "Mentors",
            value: data?.mentors?.length ? (
              <ul className="space-y-0.5 text-base font-medium sm:text-lg">
                {data.mentors.map((m) => (
                  <li key={m.name}>{m.name}</li>
                ))}
              </ul>
            ) : (
              <span className="text-base font-medium text-fg-subtle">
                None assigned
              </span>
            ),
          },
        ]}
      />

      <DashboardStatGrid
        title="Overview"
        description="Your team activity at a glance"
      >
        {stats.map((s, i) => (
          <DashboardStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            tone={s.tone}
            delay={0.06 + i * 0.03}
            footer={
              s.label === "Project progress" &&
              data?.stats?.projectProgress != null ? (
                <Progress
                  value={data.stats.projectProgress}
                  className="mt-4"
                  showLabel={false}
                />
              ) : undefined
            }
          />
        ))}
      </DashboardStatGrid>
    </div>
  );
}
