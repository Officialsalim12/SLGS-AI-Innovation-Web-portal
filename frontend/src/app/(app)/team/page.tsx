"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Circle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

type TeamPayload = Awaited<ReturnType<typeof api.myTeam>>["team"];

export default function TeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamPayload | null>(null);
  const [meId, setMeId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.myTeam(), api.me()])
      .then(([teamRes, meRes]) => {
        setTeam(teamRes.team);
        setMeId(meRes.user.id);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load team")
      );
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  if (!team) {
    return <PageLoader label="Loading team…" />;
  }

  const teammates = team.members.filter((m) => m.id !== meId);

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div {...fade} className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-fg-subtle">Team Name</p>
        <h1 className="mt-1 break-words font-display text-2xl font-semibold text-fg sm:text-3xl md:text-4xl">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          {team.description || "Your assigned hackathon team."}
        </p>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.05 }}>
        <CardHeader
          title="Teammates"
          description="Other members on your team"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {teammates.length === 0 && (
            <Card className="sm:col-span-2 xl:col-span-4">
              <p className="text-sm text-fg-muted">
                You’re the only member on this team so far.
              </p>
            </Card>
          )}
          {teammates.map((member, i) => (
            <motion.div
              key={member.id}
              {...fade}
              transition={{ delay: 0.06 + i * 0.04 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <Avatar name={member.name} size="lg" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                    <Circle
                      className={`h-2.5 w-2.5 fill-current ${
                        member.online ? "text-emerald-light" : "text-fg-subtle"
                      }`}
                    />
                    {member.online ? "Online" : "Offline"}
                  </span>
                </div>
                <h3 className="mt-4 truncate text-lg font-medium text-fg">
                  {member.name}
                </h3>
                <p className="truncate text-sm text-purple-light">{member.role}</p>
                <p className="mt-3 text-xs text-fg-muted">
                  Assigned tasks · {member.tasks}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    window.location.href = `mailto:${member.email}`;
                  }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.15 }}>
        <CardHeader title="Assigned Mentors" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {team.mentors.length === 0 && (
            <Card className="sm:col-span-2">
              <p className="text-sm text-fg-muted">
                No mentors assigned yet. An administrator will assign mentors
                from the admin portal.
              </p>
            </Card>
          )}
          {team.mentors.map((mentor) => (
            <Card key={mentor.id} hover>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Avatar name={mentor.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-fg">{mentor.name}</h3>
                    <Badge variant={mentor.online ? "success" : "muted"}>
                      {mentor.online ? "Online" : "Away"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-fg-muted">{mentor.title}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => router.push("/mentor-chat")}
                >
                  Contact
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
