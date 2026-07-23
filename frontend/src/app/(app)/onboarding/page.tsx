"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { Input, Textarea } from "@/components/ui/form-fields";
import { api } from "@/lib/api";
import { getStoredUser, getToken, saveSession, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const steps = ["Profile", "Your role", "Team", "Code of Conduct"];

type TeamRow = Awaited<ReturnType<typeof api.teams>>["teams"][number];
type TeamRoleChoice = "LEAD" | "MEMBER";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [teamRole, setTeamRole] = useState<TeamRoleChoice | "">("");
  const [teamId, setTeamId] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.name) setName(user.name);
    if (user?.title) setTitle(user.title);
    if (user?.bio) setBio(user.bio);

    let cancelled = false;
    (async () => {
      try {
        const res = await api.teams();
        if (cancelled) return;
        setTeams(res.teams);
        if (res.teams[0]) setTeamId(res.teams[0].id);
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

  async function finish() {
    if (!accepted) {
      toast("Please accept the Code of Conduct", "error");
      return;
    }
    if (!teamRole) {
      toast("Select Project Lead or Member", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = (await api.onboarding({
        name,
        title,
        bio,
        teamId: teamId || undefined,
        teamRole,
        accepted: true,
      })) as { user?: AuthUser };

      if (res.user) {
        const token = getToken();
        if (token) saveSession(token, res.user);
      }

      localStorage.setItem(
        "ghs-onboarding-complete",
        JSON.stringify({
          name,
          title,
          bio,
          teamId,
          teamRole,
          acceptedAt: new Date().toISOString(),
        })
      );
      toast("Welcome aboard!", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not complete onboarding",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading onboarding…" />;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          First login setup
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Tell us if you are the Project Lead or a Member, then confirm your
          team and accept the Code of Conduct.
        </p>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs",
              i === step
                ? "bg-purple/30 text-purple-light"
                : i < step
                  ? "bg-emerald/15 text-emerald-light"
                  : "bg-surface-muted text-fg-subtle"
            )}
          >
            {i < step && <Check className="h-3 w-3" />}
            {s}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Role / title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Frontend Developer"
            />
            <Textarea
              label="Short bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="What are you excited to build?"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-fg-muted">
              Each team has one Project Lead. The lead creates role assignments
              and sets up the Kanban board. Members update progress and comment
              on their tasks.
            </p>
            {(
              [
                {
                  value: "LEAD" as const,
                  title: "Project Lead",
                  body: "Create roles, assign teammates, and set up Kanban tasks for the team.",
                },
                {
                  value: "MEMBER" as const,
                  title: "Member",
                  body: "Receive assigned roles and tasks, then update progress and leave comments.",
                },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border px-4 py-3",
                  teamRole === option.value
                    ? "border-purple/50 bg-purple/10"
                    : "border-line bg-surface-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="teamRole"
                    checked={teamRole === option.value}
                    onChange={() => setTeamRole(option.value)}
                  />
                  <span className="font-medium text-fg">{option.title}</span>
                </div>
                <span className="mt-1 pl-7 text-xs text-fg-subtle">
                  {option.body}
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-fg-muted">
              Select your assigned team, or confirm the team set by an
              administrator.
            </p>
            {teams.length === 0 && (
              <p className="text-sm text-fg-subtle">No teams available yet.</p>
            )}
            {teams.map((t) => {
              const hasLead = t.members.some((m) => m.role === "LEAD");
              const leadBlocked = teamRole === "LEAD" && hasLead;
              return (
                <label
                  key={t.id}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-xl border px-4 py-3",
                    teamId === t.id
                      ? "border-purple/50 bg-purple/10"
                      : "border-line bg-surface-muted",
                    leadBlocked && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="team"
                      checked={teamId === t.id}
                      disabled={leadBlocked}
                      onChange={() => setTeamId(t.id)}
                    />
                    <span className="font-medium text-fg">{t.name}</span>
                  </div>
                  <span className="mt-1 pl-7 text-xs text-fg-subtle">
                    Mentors: {t.mentors.length ? t.mentors.join(", ") : "—"}
                    {leadBlocked
                      ? " · Already has a Project Lead — join as Member"
                      : ""}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm text-fg-muted">
            <p>
              By joining the Innovation Hackathon you agree to collaborate
              respectfully, credit teammates, avoid plagiarism, protect shared
              credentials, and follow organizer decisions.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-fg-muted">
              <li>Be kind and inclusive in chat and feedback.</li>
              <li>Do not share private mentor conversations outside your team.</li>
              <li>Submit only work your team built during the event.</li>
              <li>Report issues to administrators promptly.</li>
            </ul>
            <label className="flex items-start gap-3 rounded-xl bg-surface-muted p-4">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 accent-purple"
              />
              <span>
                I accept the Hackathon Code of Conduct and understand that
                violations may result in removal from the programme.
              </span>
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              disabled={submitting}
              onClick={() => {
                if (step === 0 && !name.trim()) {
                  toast("Enter your name", "error");
                  return;
                }
                if (step === 1 && !teamRole) {
                  toast("Select Project Lead or Member", "error");
                  return;
                }
                if (step === 2 && !teamId) {
                  toast("Select a team", "error");
                  return;
                }
                setStep((s) => s + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={finish} loading={submitting}>
              Enter dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
