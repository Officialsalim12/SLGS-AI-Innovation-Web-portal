"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

type Participant = Awaited<
  ReturnType<typeof api.adminParticipants>
>["participants"][number];
type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];

const selectClass =
  "h-9 min-w-[10rem] rounded-xl border border-line bg-input px-3 text-sm text-fg outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [destinations, setDestinations] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    const [peopleRes, teamsRes] = await Promise.all([
      api.adminParticipants(),
      api.teams(),
    ]);
    setParticipants(peopleRes.participants);
    setTeams(teamsRes.teams);
    return peopleRes.participants;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAll();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load participants"
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

  async function moveParticipant(person: Participant, teamId: string | null) {
    if (busyId) return;
    setBusyId(person.id);
    try {
      const res = await api.moveParticipant(person.id, teamId);
      setParticipants((list) =>
        list.map((p) =>
          p.id === person.id
            ? { ...p, team: res.team, teamId: res.teamId }
            : p
        )
      );
      setDestinations((prev) => ({ ...prev, [person.id]: "" }));
      toast(
        teamId
          ? `${person.name} moved to ${res.team}`
          : `${person.name} removed from team`,
        "success"
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update team", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteParticipant(person: Participant) {
    if (busyId) return;
    const confirmed = window.confirm(
      `Delete ${person.name}? This removes their account and cannot be undone.`
    );
    if (!confirmed) return;

    setBusyId(person.id);
    try {
      await api.deleteParticipant(person.id);
      setParticipants((list) => list.filter((p) => p.id !== person.id));
      toast(`${person.name} deleted`, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not delete participant",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  function Actions({ person }: { person: Participant }) {
    const busy = busyId === person.id;
    const destination = destinations[person.id] || "";
    const otherTeams = teams.filter((t) => t.id !== person.teamId);

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={destination}
          disabled={busy || otherTeams.length === 0}
          onChange={(e) =>
            setDestinations((prev) => ({ ...prev, [person.id]: e.target.value }))
          }
          className={selectClass}
          aria-label={`Move ${person.name} to team`}
        >
          <option value="">Move to team</option>
          {otherTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          disabled={busy || !destination}
          onClick={() => moveParticipant(person, destination)}
        >
          Transfer
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !person.teamId}
          onClick={() => moveParticipant(person, null)}
        >
          Remove from team
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={busy}
          onClick={() => deleteParticipant(person)}
          aria-label={`Delete ${person.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {busy ? "Working…" : "Delete"}
        </Button>
      </div>
    );
  }

  if (loading) {
    return <PageLoader label="Loading participants…" />;
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
      <PortalPageHeader
        title="Participants"
        description="Transfer a participant to another team, remove them from a team, or delete their account."
      />

      <div className="grid gap-3 md:hidden">
        {participants.length === 0 && (
          <Card>
            <p className="text-sm text-fg-muted">
              No participant accounts yet. Students should sign up at the
              Participant Portal, then they will appear here.
            </p>
          </Card>
        )}
        {participants.map((p) => (
          <Card key={p.id}>
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{p.name}</p>
              <p className="mt-0.5 break-all text-xs text-fg-subtle">{p.email}</p>
              <p className="mt-2 text-sm text-fg-muted">{p.team}</p>
            </div>
            <div className="mt-4">
              <Actions person={p} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Team</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-fg-muted">
                    No participant accounts yet. Students should sign up at the
                    Participant Portal.
                  </td>
                </tr>
              )}
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-line align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-fg">{p.name}</p>
                    <p className="break-all text-xs text-fg-subtle">{p.email}</p>
                  </td>
                  <td className="px-5 py-4 text-fg-muted">{p.team}</td>
                  <td className="px-5 py-4">
                    <Actions person={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
