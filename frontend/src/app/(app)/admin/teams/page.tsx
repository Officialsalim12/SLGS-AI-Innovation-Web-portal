"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Card, CardHeader } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];
type Participant = Awaited<
  ReturnType<typeof api.adminParticipants>
>["participants"][number];

export default function AdminTeamsPage() {
  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);
  const [locking, setLocking] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAll() {
    const [teamsRes, participantsRes] = await Promise.all([
      api.teams(),
      api.adminParticipants(),
    ]);
    setTeams(teamsRes.teams);
    setParticipants(participantsRes.participants);
    setLocked(
      teamsRes.teams.length > 0 && teamsRes.teams.every((t) => t.locked)
    );
    return teamsRes.teams;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await loadAll();
        if (!cancelled && list[0]) {
          setSelectedTeamId(list[0].id);
          setMemberIds(list[0].members.map((m) => m.id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load teams");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

  useEffect(() => {
    if (!selectedTeam) {
      setMemberIds([]);
      return;
    }
    setMemberIds(selectedTeam.members.map((m) => m.id));
  }, [selectedTeamId, selectedTeam?.id]);

  const assignedElsewhere = useMemo(() => {
    const map = new Map<string, string>();
    for (const team of teams) {
      if (team.id === selectedTeamId) continue;
      for (const m of team.members) {
        map.set(m.id, team.name);
      }
    }
    return map;
  }, [teams, selectedTeamId]);

  async function createTeam() {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const res = (await api.createTeam({ name: name.trim() })) as {
        team?: { id: string };
      };
      toast(`Team “${name.trim()}” created`, "success");
      setName("");
      const list = await loadAll();
      const createdId = res.team?.id || list.find((t) => t.name === name.trim())?.id;
      if (createdId) {
        setSelectedTeamId(createdId);
        setMemberIds([]);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create team", "error");
    } finally {
      setCreating(false);
    }
  }

  async function deleteTeam(team: TeamRow) {
    if (deletingId) return;
    const confirmed = window.confirm(
      `Delete team “${team.name}”? Members stay in the system but leave this team.`
    );
    if (!confirmed) return;

    setDeletingId(team.id);
    try {
      await api.deleteTeam(team.id);
      const list = await loadAll();
      if (selectedTeamId === team.id) {
        setSelectedTeamId(list[0]?.id || "");
      }
      toast(`Team “${team.name}” deleted`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete team", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleMember(id: string) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function saveMembers() {
    if (!selectedTeam || savingMembers) return;
    if (selectedTeam.locked) {
      toast("This team is locked. Unlock teams to edit members.", "error");
      return;
    }
    setSavingMembers(true);
    try {
      const res = await api.setTeamMembers(selectedTeam.id, memberIds);
      setTeams((list) =>
        list.map((t) =>
          t.id === selectedTeam.id
            ? {
                ...t,
                members: res.team.members,
                mentors: res.team.mentors,
              }
            : {
                ...t,
                members: t.members.filter((m) => !memberIds.includes(m.id)),
              }
        )
      );
      toast(`Updated members for ${selectedTeam.name}`, "success");
      await loadAll();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update team members",
        "error"
      );
    } finally {
      setSavingMembers(false);
    }
  }

  async function toggleLock() {
    if (locking) return;
    setLocking(true);
    try {
      const next = !locked;
      const res = await api.setTeamsLocked(next);
      setLocked(res.locked);
      setTeams((list) => list.map((t) => ({ ...t, locked: res.locked })));
      toast(res.message, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update lock status",
        "error"
      );
    } finally {
      setLocking(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading teams…" />;
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
        title="Team Management"
        description="Create teams and add participants. Mentors are assigned separately."
      />

      <Card>
        <CardHeader title="Create team" />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="min-w-0 w-full flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              onKeyDown={(e) => {
                if (e.key === "Enter") createTeam();
              }}
            />
          </div>
          <Button
            onClick={createTeam}
            loading={creating}
            disabled={!name.trim()}
            className="h-11 w-full shrink-0 sm:w-auto sm:min-w-[9.5rem]"
          >
            {creating ? "Creating…" : "Create team"}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full sm:w-auto"
          onClick={toggleLock}
          loading={locking}
          disabled={teams.length === 0}
        >
          {locking
            ? "Updating…"
            : locked
              ? "Unlock teams"
              : "Lock teams"}
        </Button>
        {locked && (
          <p className="mt-2 text-xs text-fg-subtle">
            Rosters are frozen — participants cannot join and admins cannot
            reassign members until unlocked.
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-6">
        <Card>
          <CardHeader title="Teams" />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {teams.length === 0 && (
              <p className="text-sm text-fg-muted">No teams yet.</p>
            )}
            {teams.map((t) => (
              <div key={t.id} className="flex shrink-0 items-center gap-1 lg:w-full">
                <button
                  type="button"
                  onClick={() => setSelectedTeamId(t.id)}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm",
                    selectedTeamId === t.id
                      ? "bg-surface-hover text-fg"
                      : "bg-surface-muted text-fg-muted hover:bg-surface-muted lg:bg-transparent"
                  )}
                >
                  <span className="block truncate font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-fg-subtle">
                    {t.members.length} member{t.members.length === 1 ? "" : "s"}
                    {t.locked ? " · Locked" : ""}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-fg-subtle hover:text-red-500"
                  disabled={deletingId === t.id}
                  onClick={() => deleteTeam(t)}
                  aria-label={`Delete ${t.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          {selectedTeam ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-fg-subtle">
                    Team
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-semibold text-fg">
                    {selectedTeam.name}
                  </h2>
                  <p className="mt-1 text-sm text-fg-muted">
                    {selectedTeam.locked
                      ? "This team is locked. Unlock teams to change members."
                      : "Select participants to add to this team."}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {participants.length === 0 && (
                  <p className="text-sm text-fg-muted">
                    No participants registered yet. After they sign up at the
                    Participant Portal, select them here to add to this team.
                  </p>
                )}
                {participants.map((p) => {
                  const checked = memberIds.includes(p.id);
                  const otherTeam = assignedElsewhere.get(p.id);
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-fg",
                        selectedTeam.locked
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={selectedTeam.locked}
                        onChange={() => toggleMember(p.id)}
                        className="mt-0.5 h-4 w-4 accent-purple"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{p.name}</span>
                        <span className="block break-all text-xs text-fg-subtle">
                          {p.email}
                        </span>
                        {otherTeam && !checked && (
                          <span className="mt-1 block text-xs text-orange-light">
                            Currently on {otherTeam} — saving moves them here
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              <Button
                className="mt-6"
                onClick={saveMembers}
                loading={savingMembers}
                disabled={selectedTeam.locked}
              >
                {savingMembers
                  ? "Saving…"
                  : selectedTeam.locked
                    ? "Team locked"
                    : "Save members"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-fg-muted">
              Create a team first, then add participants.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
