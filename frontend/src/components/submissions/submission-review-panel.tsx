"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Presentation,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/form-fields";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  clampCriterion,
  emptyScoreBreakdown,
  scoringCriteria,
  totalFromBreakdown,
  type ScoreBreakdown,
} from "@/lib/scoring";

type Submission = Awaited<
  ReturnType<typeof api.adminSubmissions>
>["submissions"][number];

const fileIcon: Record<string, typeof Github> = {
  repo: Github,
  demo: Globe,
  pitch: Presentation,
  video: Video,
  docs: FileText,
  prototype: Globe,
};

function statusLabel(status: string) {
  if (status === "FINAL") return "Complete";
  if (status === "UNDER_REVIEW") return "In review";
  if (status === "SUBMITTED") return "Pending";
  if (status === "DRAFT") return "Draft";
  return status;
}

function statusVariant(status: string) {
  if (status === "FINAL") return "success" as const;
  if (status === "SUBMITTED" || status === "DRAFT") return "warning" as const;
  return "blue" as const;
}

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function openOrDownload(url: string, label: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  const looksDownloadable =
    /\.(zip|pdf|pptx?|docx?|mp4|mov|webm)(\?|$)/i.test(url) ||
    label.toLowerCase().includes("zip");
  if (looksDownloadable) {
    anchor.download = "";
  }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function SubmissionReviewPanel({
  title = "Project Reviews",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [canScore, setCanScore] = useState(false);
  const [active, setActive] = useState("");
  const [comment, setComment] = useState("");
  const [breakdown, setBreakdown] = useState<ScoreBreakdown>(emptyScoreBreakdown());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await api.adminSubmissions();
    setSubmissions(res.submissions);
    setCanScore(Boolean(res.canScore));
    return res.submissions;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await reload();
        if (!cancelled && list[0]) {
          setActive(list[0].id);
          if (list[0].breakdown) setBreakdown(list[0].breakdown);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load submissions"
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

  const item = submissions.find((s) => s.id === active);

  useEffect(() => {
    if (!item) return;
    setBreakdown(item.breakdown || emptyScoreBreakdown());
    setComment(item.scoreNotes || "");
  }, [item]);

  const scoreTotal = totalFromBreakdown(breakdown);

  async function saveReview(opts: {
    status?: string;
    publishScore?: boolean;
  }) {
    if (!item || busy) return;
    const isReopen = opts.status === "DRAFT";
    if (isReopen && !comment.trim()) {
      toast("Add feedback before reopening so the team knows what to fix", "error");
      return;
    }
    if (opts.publishScore) {
      for (const c of scoringCriteria) {
        const value = breakdown[c.key];
        if (value < 0 || value > c.weight) {
          toast(`${c.name} must be between 0 and ${c.weight}`, "error");
          return;
        }
      }
      if (scoreTotal <= 0) {
        toast("Enter scores for the four judging criteria", "error");
        return;
      }
    }
    setBusy(true);
    try {
      await api.updateSubmission({
        id: item.id,
        status: opts.status || item.status,
        notes: comment.trim() || undefined,
        ...(opts.publishScore
          ? {
              solutionDevelopment: breakdown.solutionDevelopment,
              challengeRequirements: breakdown.challengeRequirements,
              presentation: breakdown.presentation,
              communication: breakdown.communication,
              score: scoreTotal,
            }
          : {}),
      });
      toast(
        opts.publishScore
          ? `Score published (${scoreTotal}/100) — team notified`
          : isReopen
            ? "Submission reopened and feedback sent to the team"
            : opts.status === "UNDER_REVIEW"
              ? comment.trim()
                ? "Marked in review and feedback sent to the team"
                : "Marked in review"
              : comment.trim()
                ? "Feedback saved and sent to the team"
                : "Review saved",
        "success"
      );
      const list = await reload();
      const next = list.find((s) => s.id === item.id);
      if (next) setActive(next.id);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update submission",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading project files…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {description ||
            (canScore
              ? "Open team files, leave feedback, and publish scores using the four judging criteria."
              : "Open assigned team files, leave feedback, and mark projects in review. Admins publish final scores.")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-6">
        <Card>
          <CardHeader title="Team projects" />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {submissions.length === 0 && (
              <p className="text-sm text-fg-muted">
                No project submissions yet.
              </p>
            )}
            {submissions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={`min-w-[12rem] shrink-0 rounded-xl px-3 py-3 text-left lg:min-w-0 lg:w-full ${
                  active === s.id
                    ? "bg-surface-hover"
                    : "bg-surface-muted hover:bg-surface-muted lg:bg-transparent"
                }`}
              >
                <p className="truncate text-sm font-medium text-fg">{s.team}</p>
                <p className="truncate text-xs text-fg-subtle">{s.project}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(s.status)}>
                    {statusLabel(s.status)}
                  </Badge>
                  {s.score != null && (
                    <span className="text-xs text-purple-light">
                      Score {s.score}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="min-w-0 space-y-5">
          {item ? (
            <>
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-fg sm:text-2xl">
                  {item.project}
                </h2>
                <p className="mt-1 flex flex-wrap gap-x-2 text-sm text-fg-muted">
                  <span>{item.team}</span>
                  <span>·</span>
                  <span>{formatTimestamp(String(item.timestamp))}</span>
                  {item.score != null && (
                    <>
                      <span>·</span>
                      <span className="text-purple-light">
                        Current score {item.score}/100
                      </span>
                    </>
                  )}
                </p>
                {item.breakdown && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    Dev {item.breakdown.solutionDevelopment}/40 · Req{" "}
                    {item.breakdown.challengeRequirements}/25 · Pitch{" "}
                    {item.breakdown.presentation}/20 · Team{" "}
                    {item.breakdown.communication}/15
                  </p>
                )}
                {item.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                    {item.description}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-fg">
                  Project files
                </h3>
                <p className="mt-1 text-xs text-fg-subtle">
                  Open or download each asset the team submitted.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(item.files && item.files.length > 0
                    ? item.files
                    : (
                        [
                          item.repo
                            ? {
                                key: "repo",
                                label: "GitHub Repository",
                                url: item.repo,
                              }
                            : null,
                          item.demo
                            ? {
                                key: "demo",
                                label: "Live Demo",
                                url: item.demo,
                              }
                            : null,
                          typeof item.video === "string" && item.video
                            ? {
                                key: "video",
                                label: "Demo Video",
                                url: item.video,
                              }
                            : null,
                          typeof item.docs === "string" && item.docs
                            ? {
                                key: "docs",
                                label: "Documentation",
                                url: item.docs,
                              }
                            : null,
                        ] as Array<{
                          key: string;
                          label: string;
                          url: string;
                        } | null>
                      ).filter(
                        (f): f is { key: string; label: string; url: string } =>
                          Boolean(f?.url)
                      )
                  ).map((file) => {
                    const Icon = fileIcon[file.key] || FileText;
                    return (
                      <div
                        key={file.key}
                        className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-muted px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-purple-light" />
                          <span className="truncate text-sm text-fg">
                            {file.label}
                          </span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              window.open(
                                file.url,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openOrDownload(file.url, file.label)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!item.files || item.files.length === 0) &&
                    !item.repo &&
                    !item.demo && (
                      <p className="text-sm text-fg-muted sm:col-span-2">
                        No file links attached yet.
                      </p>
                    )}
                </div>
              </div>

              <Textarea
                label="Comments / Feedback"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share review notes for the team (required when reopening)"
              />

              {canScore ? (
                <div className="space-y-3 rounded-xl border border-line bg-surface-muted p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-fg">
                        Setup score by criteria
                      </h3>
                    </div>
                    <p className="font-display text-2xl font-semibold text-purple-light">
                      {scoreTotal}
                      <span className="text-sm text-fg-subtle">/100</span>
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scoringCriteria.map((c) => (
                      <label key={c.key} className="block text-sm">
                        <span className="mb-1.5 flex items-center justify-between gap-2 text-fg-muted">
                          <span className="min-w-0 truncate">{c.name}</span>
                          <span className="shrink-0 text-xs">
                            max {c.weight}
                          </span>
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={c.weight}
                          value={breakdown[c.key]}
                          onChange={(e) =>
                            setBreakdown((prev) => ({
                              ...prev,
                              [c.key]: clampCriterion(
                                Number(e.target.value),
                                c.weight
                              ),
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-line bg-input px-4 text-sm text-fg outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
                        />
                        <span className="mt-1 block text-[11px] text-fg-subtle">
                          {c.summary}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      loading={busy}
                      onClick={() =>
                        saveReview({
                          status: "FINAL",
                          publishScore: true,
                        })
                      }
                    >
                      Publish score
                    </Button>
                    <Button
                      variant="outline"
                      loading={busy}
                      onClick={() =>
                        saveReview({ status: "UNDER_REVIEW" })
                      }
                    >
                      Mark in review
                    </Button>
                    <Button
                      variant="ghost"
                      loading={busy}
                      onClick={() => saveReview({ status: "DRAFT" })}
                    >
                      Reopen &amp; send feedback
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    loading={busy}
                    disabled={!comment.trim()}
                    onClick={() => saveReview({ status: "UNDER_REVIEW" })}
                  >
                    Send feedback
                  </Button>
                  <Button
                    variant="outline"
                    loading={busy}
                    onClick={() => saveReview({ status: "UNDER_REVIEW" })}
                  >
                    Mark in review
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-fg-muted">Select a project to review.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
