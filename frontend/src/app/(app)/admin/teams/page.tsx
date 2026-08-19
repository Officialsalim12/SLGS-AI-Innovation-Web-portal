"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
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

function roleLabel(role: Participant["teamRole"]) {
  if (role === "LEAD") return "Lead";
  if (role === "MEMBER") return "Member";
  return "—";
}

export default function AdminTeamsPage() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
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
  }, [selectedTeam]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = participants.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    });

    const onRoster: Participant[] = [];
    const available: Participant[] = [];
    const elsewhere: Participant[] = [];

    for (const p of filtered) {
      if (memberIds.includes(p.id)) onRoster.push(p);
      else if (!p.teamId) available.push(p);
      else elsewhere.push(p);
    }

    const byName = (a: Participant, b: Participant) =>
      a.name.localeCompare(b.name);
    onRoster.sort(byName);
    available.sort(byName);
    elsewhere.sort(byName);

    return { onRoster, available, elsewhere };
  }, [participants, memberIds, query]);

  async function createTeam() {
    if (!name.trim() || creating) return;
    const teamName = name.trim();
    setCreating(true);
    try {
      const res = (await api.createTeam({ name: teamName })) as {
        team?: { id: string };
      };
      toast(`${teamName} created`, "success");
      setName("");
      const list = await loadAll();
      const createdId =
        res.team?.id || list.find((t) => t.name === teamName)?.id;
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
      `Delete ${team.name}? Participants remain in the programme but leave this team.`
    );
    if (!confirmed) return;

    setDeletingId(team.id);
    try {
      await api.deleteTeam(team.id);
      const list = await loadAll();
      if (selectedTeamId === team.id) {
        setSelectedTeamId(list[0]?.id || "");
      }
      toast(`${team.name} deleted`, "success");
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
      toast("Unlock rosters before editing members.", "error");
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
      toast(`Roster saved for ${selectedTeam.name}`, "success");
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
      <div className="rounded-lg border border-line bg-card px-4 py-3 text-sm text-fg-muted">
        {error}
      </div>
    );
  }

  const dirty = selectedTeam
    ? memberIds.length !== selectedTeam.members.length ||
      memberIds.some((id) => !selectedTeam.members.some((m) => m.id === id))
    : false;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            Teams
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {teams.length} team{teams.length === 1 ? "" : "s"} ·{" "}
            {participants.length} participant
            {participants.length === 1 ? "" : "s"}
            {locked ? " · rosters locked" : ""}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New team name"
            className="h-10 rounded-lg sm:w-56"
            onKeyDown={(e) => {
              if (e.key === "Enter") createTeam();
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={createTeam}
              loading={creating}
              disabled={!name.trim()}
              className="h-10 rounded-lg"
            >
              Create
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-lg"
              onClick={toggleLock}
              loading={locking}
              disabled={teams.length === 0}
            >
              {locked ? "Unlock" : "Lock"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[32rem] overflow-hidden rounded-lg border border-line bg-card lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="border-b border-line lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <p className="text-xs font-medium text-fg-subtle">Teams</p>
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-thin lg:max-h-[calc(100%-2.75rem)]">
            {teams.length === 0 && (
              <p className="px-3 py-4 text-sm text-fg-muted">No teams yet.</p>
            )}
            {teams.map((t) => {
              const active = selectedTeamId === t.id;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-stretch border-b border-line/80 last:border-b-0",
                    active ? "bg-surface-hover" : "hover:bg-surface-muted"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(t.id)}
                    className={cn(
                      "min-w-0 flex-1 px-3 py-2.5 text-left",
                      active && "border-l-2 border-brand"
                    )}
                  >
                    <span className="block truncate text-sm font-medium text-fg">
                      {t.name}
                    </span>
                    <span className="block text-xs text-fg-subtle">
                      {t.members.length} {t.members.length === 1 ? "member" : "members"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="shrink-0 px-2.5 text-fg-subtle hover:text-red-600 disabled:opacity-40"
                    disabled={deletingId === t.id}
                    onClick={() => deleteTeam(t)}
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          {selectedTeam ? (
            <>
              <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-fg">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-xs text-fg-muted">
                    {memberIds.length} selected
                    {dirty ? " · unsaved changes" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or email"
                      className="h-9 w-full rounded-lg border border-line bg-input pl-8 pr-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand/50"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 rounded-lg"
                    onClick={saveMembers}
                    loading={savingMembers}
                    disabled={selectedTeam.locked}
                  >
                    {selectedTeam.locked ? "Locked" : "Save"}
                  </Button>
                </div>
              </div>

              {participants.length === 0 ? (
                <p className="px-4 py-8 text-sm text-fg-muted">
                  No participants have registered yet.
                </p>
              ) : (
                <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="sticky top-0 bg-card text-xs font-medium text-fg-subtle">
                      <tr className="border-b border-line">
                        <th className="w-10 px-4 py-2.5" />
                        <th className="px-3 py-2.5">Name</th>
                        <th className="px-3 py-2.5">Email</th>
                        <th className="px-3 py-2.5">Role</th>
                        <th className="px-3 py-2.5">Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      <PersonGroup
                        title="On this team"
                        people={rows.onRoster}
                        memberIds={memberIds}
                        locked={selectedTeam.locked}
                        onToggle={toggleMember}
                      />
                      <PersonGroup
                        title="Unassigned"
                        people={rows.available}
                        memberIds={memberIds}
                        locked={selectedTeam.locked}
                        onToggle={toggleMember}
                      />
                      <PersonGroup
                        title="Other teams"
                        people={rows.elsewhere}
                        memberIds={memberIds}
                        locked={selectedTeam.locked}
                        onToggle={toggleMember}
                      />
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="px-4 py-8 text-sm text-fg-muted">
              Create a team to start building a roster.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function PersonGroup({
  title,
  people,
  memberIds,
  locked,
  onToggle,
}: {
  title: string;
  people: Participant[];
  memberIds: string[];
  locked: boolean;
  onToggle: (id: string) => void;
}) {
  if (people.length === 0) return null;

  return (
    <>
      <tr className="bg-surface-muted/80">
        <td colSpan={5} className="px-4 py-1.5 text-[11px] font-medium text-fg-subtle">
          {title} ({people.length})
        </td>
      </tr>
      {people.map((p) => {
          const checked = memberIds.includes(p.id);
          return (
            <tr
              key={p.id}
              className="border-b border-line/70 last:border-b-0 hover:bg-surface-muted/60"
            >
              <td className="px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={() => onToggle(p.id)}
                  className="h-3.5 w-3.5 accent-[var(--brand)] disabled:opacity-50"
                  aria-label={`Include ${p.name}`}
                />
              </td>
              <td className="px-3 py-2.5 font-medium text-fg">{p.name}</td>
              <td className="px-3 py-2.5 text-fg-muted">{p.email}</td>
              <td className="px-3 py-2.5 text-fg-muted">{roleLabel(p.teamRole)}</td>
              <td className="px-3 py-2.5 text-fg-muted">
                {p.teamId ? p.team : "—"}
              </td>
            </tr>
          );
        })}
    </>
  );
}
