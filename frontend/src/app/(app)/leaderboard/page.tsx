"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { Input } from "@/components/ui/form-fields";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Row = Awaited<ReturnType<typeof api.leaderboard>>["leaderboard"][number];
type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];

function podiumTone(rank: number) {
  if (rank === 1) return "from-amber-400/30 via-amber-200/10 to-transparent border-amber-400/40";
  if (rank === 2) return "from-slate-300/25 via-slate-200/10 to-transparent border-slate-300/35";
  if (rank === 3) return "from-orange-500/25 via-orange-300/10 to-transparent border-orange-400/35";
  return "from-brand/10 to-transparent border-line/70";
}

function rankBadge(rank: number) {
  if (rank === 1) return "bg-amber-400 text-ink";
  if (rank === 2) return "bg-slate-300 text-ink";
  if (rank === 3) return "bg-orange-400 text-ink";
  return "bg-brand/15 text-brand";
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadLeaderboard() {
    const res = await api.leaderboard();
    setRows(res.leaderboard);
    return res.leaderboard;
  }

  useEffect(() => {
    const admin = getStoredUser()?.role === "ADMIN";
    setIsAdmin(admin);
    let cancelled = false;
    (async () => {
      try {
        const board = await loadLeaderboard();
        if (cancelled) return;
        if (board[0]) setSelected(board[0]);
        if (admin) {
          const teamsRes = await api.teams();
          if (cancelled) return;
          setTeams(teamsRes.teams);
          if (teamsRes.teams[0]) setTeamId(teamsRes.teams[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load leaderboard"
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

  async function publishScore() {
    if (!teamId) {
      toast("Select a team", "error");
      return;
    }
    const value = Number(score);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      toast("Enter a score between 0 and 100", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api.setLeaderboardScore({
        teamId,
        score: value,
      });
      setRows(res.leaderboard);
      const updated =
        res.leaderboard.find((r) => r.teamId === teamId) ||
        res.leaderboard[0] ||
        null;
      setSelected(updated);
      setScore("");
      toast("Leaderboard score published", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not publish score",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading leaderboard…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  const topThree = rows.slice(0, 3);
  const rest = rows.slice(3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Leaderboard"
        description={
          isAdmin
            ? "Publish team scores for Demo Day. Rankings update instantly for everyone."
            : "Live programme rankings — scores are published by administrators."
        }
      />

      {isAdmin && (
        <Card className="space-y-4 border-brand/20 bg-gradient-to-br from-brand/8 to-transparent">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-fg">Publish a score</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Only administrators can set or update team scores.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1.5 block text-fg-muted">Team</span>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-line bg-input px-4 text-sm text-fg outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              >
                {teams.length === 0 && <option value="">No teams</option>}
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Score (0–100)"
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="85"
            />
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={publishScore}
                loading={saving}
                disabled={!teamId}
              >
                {saving ? "Publishing…" : "Publish score"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {rows.length === 0 ? (
        <Card className="py-16 text-center">
          <Trophy className="mx-auto h-10 w-10 text-fg-subtle" />
          <p className="mt-4 text-fg-muted">
            No scores published yet
            {isAdmin ? " — use Publish a score above." : "."}
          </p>
        </Card>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 md:items-end">
              {podiumOrder.map((row, visualIndex) => {
                if (!row) return null;
                const height =
                  row.rank === 1 ? "md:min-h-[220px]" : "md:min-h-[180px]";
                return (
                  <motion.button
                    key={row.teamId || row.team}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visualIndex * 0.06 }}
                    onClick={() => setSelected(row)}
                    className={cn(
                      "relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-b p-5 text-left transition hover:scale-[1.01]",
                      podiumTone(row.rank),
                      height,
                      selected?.teamId === row.teamId && "ring-2 ring-brand/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-bold",
                          rankBadge(row.rank)
                        )}
                      >
                        #{row.rank}
                      </span>
                      {row.rank === 1 ? (
                        <Medal className="h-6 w-6 text-amber-500" />
                      ) : (
                        <Trophy className="h-5 w-5 text-fg-subtle" />
                      )}
                    </div>
                    <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
                      {row.team}
                    </h3>
                    <p className="mt-2 font-display text-4xl font-semibold text-fg">
                      {row.score}
                      <span className="ml-1 text-base font-medium text-fg-subtle">
                        pts
                      </span>
                    </p>
                    <p className="mt-3 text-xs text-fg-muted">
                      {row.members.length} member
                      {row.members.length === 1 ? "" : "s"}
                      {row.mentors.length
                        ? ` · ${row.mentors.length} mentor${
                            row.mentors.length === 1 ? "" : "s"
                          }`
                        : ""}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-6">
            <Card className="overflow-hidden p-0">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-fg">
                  Full standings
                </h2>
                <p className="mt-1 text-sm text-fg-muted">
                  Select a team to view members and mentors.
                </p>
              </div>
              <div className="divide-y divide-line">
                {(rest.length ? rest : rows).map((row, i) => (
                  <button
                    key={row.teamId || row.team}
                    type="button"
                    onClick={() => setSelected(row)}
                    className={cn(
                      "flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-muted",
                      selected?.teamId === row.teamId && "bg-brand-soft/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        rankBadge(row.rank)
                      )}
                    >
                      {row.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{row.team}</p>
                      <p className="truncate text-xs text-fg-subtle">
                        {row.members.slice(0, 3).join(", ") || "No members listed"}
                        {row.members.length > 3 ? "…" : ""}
                      </p>
                    </div>
                    <p className="font-display text-xl font-semibold text-fg">
                      {row.score}
                    </p>
                  </button>
                ))}
                {rest.length === 0 && rows.length <= 3 && (
                  <p className="px-5 py-6 text-sm text-fg-muted">
                    Top teams are shown on the podium above.
                  </p>
                )}
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/15 blur-2xl"
                aria-hidden
              />
              {selected ? (
                <div className="relative space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fg-subtle">
                      Rank #{selected.rank}
                    </p>
                    <h2 className="mt-1 break-words font-display text-2xl font-semibold text-fg">
                      {selected.team}
                    </h2>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-fg-subtle">
                      Score
                    </p>
                    <p className="mt-1 font-display text-5xl font-semibold text-fg">
                      {selected.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-fg-subtle">
                      Team members
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-fg-muted">
                      {selected.members.length ? (
                        selected.members.map((m) => <li key={m}>{m}</li>)
                      ) : (
                        <li>No members listed</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-fg-subtle">
                      Mentor(s)
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-fg-muted">
                      {selected.mentors.length ? (
                        selected.mentors.map((m) => <li key={m}>{m}</li>)
                      ) : (
                        <li>No mentors assigned</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-fg-muted">
                  Select a team to view members, mentors, and score.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
