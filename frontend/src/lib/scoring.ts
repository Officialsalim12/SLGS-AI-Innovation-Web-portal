export const scoringCriteria = [
  {
    key: "solutionDevelopment" as const,
    name: "Solution Development",
    weight: 40,
    summary:
      "Does it work? Is it well built? Is the interface usable? Did the team do something clever?",
  },
  {
    key: "challengeRequirements" as const,
    name: "Meeting Challenge Requirements",
    weight: 25,
    summary:
      "Did the team pick a real Sierra Leone problem, from the list or their own idea, and build something that answers it?",
  },
  {
    key: "presentation" as const,
    name: "Presentation & Pitching",
    weight: 20,
    summary:
      "Can the team explain what they built, show it working, and answer questions?",
  },
  {
    key: "communication" as const,
    name: "Communication & Teamwork",
    weight: 15,
    summary:
      "How did the team work together, talk to mentors, and show up during the programme?",
  },
] as const;

export type ScoreBreakdown = {
  solutionDevelopment: number;
  challengeRequirements: number;
  presentation: number;
  communication: number;
};

export function emptyScoreBreakdown(): ScoreBreakdown {
  return {
    solutionDevelopment: 0,
    challengeRequirements: 0,
    presentation: 0,
    communication: 0,
  };
}

export function totalFromBreakdown(scores: ScoreBreakdown) {
  return (
    Number(scores.solutionDevelopment || 0) +
    Number(scores.challengeRequirements || 0) +
    Number(scores.presentation || 0) +
    Number(scores.communication || 0)
  );
}

export function clampCriterion(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}
