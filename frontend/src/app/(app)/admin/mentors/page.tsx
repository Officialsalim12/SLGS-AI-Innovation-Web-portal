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

const selectClass =
  "h-9 min-w-[10rem] rounded-xl border border-line bg-input px-3 text-sm text-fg outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addTeamId, setAddTeamId] = useState("");
  const [transferTeamId, setTransferTeamId] = useState("");

  async function loadMentors(preferId?: string) {
    const mentorsRes = await api.mentors();
    setMentors(mentorsRes.mentors);
    const nextId =
      preferId && mentorsRes.mentors.some((m) => m.id === preferId)
        ? preferId
        : mentorsRes.mentors[0]?.id || "";
    setSelectedMentor(nextId);
    return mentorsRes.mentors;
  }

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
  const assignedIds = mentor?.teamIds || [];
  const unassignedTeams = teams.filter((t) => !assignedIds.includes(t.id));

  async function setAssignments(teamIds: string[], success: string) {
    if (!mentor || saving) return;
    setSaving(true);
    try {
      await api.assignMentors({ mentorId: mentor.id, teamIds });
      await loadMentors(mentor.id);
      setAddTeamId("");
      setTransferTeamId("");
      toast(success, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update assignments",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function removeFromTeam(teamId: string) {
    const teamName = teams.find((t) => t.id === teamId)?.name || "team";
    void setAssignments(
      assignedIds.filter((id) => id !== teamId),
      `${mentor?.name} removed from ${teamName}`
    );
  }

  function addToTeam() {
    if (!addTeamId) return;
    const teamName = teams.find((t) => t.id === addTeamId)?.name || "team";
    void setAssignments(
      [...assignedIds, addTeamId],
      `${mentor?.name} added to ${teamName}`
    );
  }

  function transferToTeam() {
    if (!transferTeamId) return;
    const teamName = teams.find((t) => t.id === transferTeamId)?.name || "team";
    void setAssignments(
      [transferTeamId],
      `${mentor?.name} transferred to ${teamName}`
    );
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
      setSelectedMentor(nextList[0]?.id || "");
      setAddTeamId("");
      setTransferTeamId("");
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
        description="Remove a mentor from a team, transfer them to another team, or delete their account."
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
                onClick={() => {
                  setSelectedMentor(m.id);
                  setAddTeamId("");
                  setTransferTeamId("");
                }}
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
                {assignedIds.length === 0 && (
                  <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg-muted">
                    Not assigned to a team yet.
                  </p>
                )}
                {assignedIds.map((teamId) => {
                  const team = teams.find((t) => t.id === teamId);
                  if (!team) return null;
                  return (
                    <div
                      key={team.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg"
                    >
                      <span className="min-w-0 truncate">{team.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => removeFromTeam(team.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-fg-subtle">
                    Add to team
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={addTeamId}
                      disabled={saving || unassignedTeams.length === 0}
                      onChange={(e) => setAddTeamId(e.target.value)}
                      className={selectClass}
                      aria-label="Add mentor to team"
                    >
                      <option value="">Choose team</option>
                      {unassignedTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={saving || !addTeamId}
                      onClick={addToTeam}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-fg-subtle">
                    Transfer to team
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={transferTeamId}
                      disabled={saving || teams.length === 0}
                      onChange={(e) => setTransferTeamId(e.target.value)}
                      className={selectClass}
                      aria-label="Transfer mentor to team"
                    >
                      <option value="">Choose team</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={
                        saving ||
                        !transferTeamId ||
                        (assignedIds.length === 1 &&
                          assignedIds[0] === transferTeamId)
                      }
                      onClick={transferToTeam}
                    >
                      Transfer
                    </Button>
                  </div>
                </div>
              </div>
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
