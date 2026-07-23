"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Card, CardHeader } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Mentor = Awaited<ReturnType<typeof api.mentors>>["mentors"][number];
type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mentorsRes, teamsRes] = await Promise.all([
          api.mentors(),
          api.teams(),
        ]);
        if (cancelled) return;
        setMentors(mentorsRes.mentors);
        setTeams(teamsRes.teams);
        const map: Record<string, string[]> = {};
        for (const m of mentorsRes.mentors) {
          map[m.id] = [...m.teamIds];
        }
        setAssignments(map);
        if (mentorsRes.mentors[0]) setSelectedMentor(mentorsRes.mentors[0].id);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load mentors"
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

  const mentor = mentors.find((m) => m.id === selectedMentor);
  const selectedTeams = assignments[selectedMentor] || [];

  function toggleTeam(teamId: string) {
    setAssignments((prev) => {
      const current = prev[selectedMentor] || [];
      const next = current.includes(teamId)
        ? current.filter((t) => t !== teamId)
        : [...current, teamId];
      return { ...prev, [selectedMentor]: next };
    });
  }

  async function save() {
    if (!mentor || saving) return;
    setSaving(true);
    try {
      await api.assignMentors({
        mentorId: mentor.id,
        teamIds: assignments[mentor.id] || [],
      });
      const mentorsRes = await api.mentors();
      setMentors(mentorsRes.mentors);
      const map: Record<string, string[]> = {};
      for (const m of mentorsRes.mentors) {
        map[m.id] = [...m.teamIds];
      }
      setAssignments(map);
      toast(`Saved assignments for ${mentor.name}`, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not save assignments",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeMentor() {
    if (!mentor || deleting) return;
    const confirmed = window.confirm(
      `Delete mentor ${mentor.name}? This removes their account and cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.deleteMentor(mentor.id);
      const nextList = mentors.filter((m) => m.id !== mentor.id);
      setMentors(nextList);
      setAssignments((prev) => {
        const copy = { ...prev };
        delete copy[mentor.id];
        return copy;
      });
      setSelectedMentor(nextList[0]?.id || "");
      toast(`${mentor.name} deleted`, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not delete mentor",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading mentors…" />;
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
        title="Assign Mentors"
        description="Mentors register their own accounts. Select a mentor here, choose teams, then save."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-6">
        <Card>
          <CardHeader title="Mentors" />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {mentors.length === 0 && (
              <p className="text-sm text-fg-muted">
                No mentor accounts yet. Mentors should sign up at the Mentor
                Portal, then they will appear here.
              </p>
            )}
            {mentors.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMentor(m.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2.5 text-left text-sm lg:w-full",
                  selectedMentor === m.id
                    ? "bg-surface-hover text-fg"
                    : "bg-surface-muted text-fg-muted hover:bg-surface-muted lg:bg-transparent"
                )}
              >
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          {mentor ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-fg-subtle">
                    Mentor
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-semibold text-fg">
                    {mentor.name}
                  </h2>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="shrink-0"
                  disabled={deleting}
                  onClick={removeMentor}
                  aria-label={`Delete ${mentor.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
              <p className="mt-6 text-xs uppercase tracking-wider text-fg-subtle">
                Assigned Teams
              </p>
              <div className="mt-3 space-y-2">
                {teams.map((t) => {
                  const checked = selectedTeams.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTeam(t.id)}
                        className="h-4 w-4 accent-purple"
                      />
                      {t.name}
                    </label>
                  );
                })}
              </div>
              <Button className="mt-6" onClick={save} loading={saving}>
                Save assignments
              </Button>
            </>
          ) : (
            <p className="text-sm text-fg-muted">
              {mentors.length === 0
                ? "Waiting for mentors to register their accounts."
                : "Select a mentor."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
