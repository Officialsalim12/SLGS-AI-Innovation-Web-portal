"use client";

import { useEffect, useState } from "react";
import { PortalPageHeader } from "@/components/dashboard/dashboard-chrome";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";

type Participant = Awaited<
  ReturnType<typeof api.adminParticipants>
>["participants"][number];

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.adminParticipants();
        if (!cancelled) setParticipants(res.participants);
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
        description="Participants register their own accounts. After they verify email, they appear here and can be added to teams."
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
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Team</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-fg-muted">
                    No participant accounts yet. Students should sign up at the
                    Participant Portal.
                  </td>
                </tr>
              )}
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="px-5 py-4">
                    <p className="font-medium text-fg">{p.name}</p>
                    <p className="break-all text-xs text-fg-subtle">{p.email}</p>
                  </td>
                  <td className="px-5 py-4 text-fg-muted">{p.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
