export const scoringCriteria = [
  {
    key: "specific" as const,
    letter: "S",
    name: "Specific",
    weight: 20,
    summary:
      "Is the problem clear? Who is this for? What exactly did the team build?",
  },
  {
    key: "measurable" as const,
    letter: "M",
    name: "Measurable",
    weight: 20,
    summary:
      "Can you see it working? Is there a demo or other evidence that it does what they claim?",
  },
  {
    key: "achievable" as const,
    letter: "A",
    name: "Achievable",
    weight: 20,
    summary:
      "Did they finish something real in the programme? Is it well built and usable?",
  },
  {
    key: "relevant" as const,
    letter: "R",
    name: "Relevant",
    weight: 20,
    summary:
      "Does it answer a real Sierra Leone need, from the challenge list or their own idea?",
  },
  {
    key: "timeBound" as const,
    letter: "T",
    name: "Time-bound",
    weight: 20,
    summary:
      "Did they hit deadlines, present a complete pitch on time, and say what comes next?",
  },
] as const;

export type ScoreBreakdown = {
  specific: number;
  measurable: number;
  achievable: number;
  relevant: number;
  timeBound: number;
};

export function emptyScoreBreakdown(): ScoreBreakdown {
  return {
    specific: 0,
    measurable: 0,
    achievable: 0,
    relevant: 0,
    timeBound: 0,
  };
}

export function totalFromBreakdown(scores: ScoreBreakdown) {
  return scoringCriteria.reduce(
    (sum, c) => sum + Number(scores[c.key] || 0),
    0
  );
}

export function clampCriterion(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function breakdownLine(scores: ScoreBreakdown) {
  return scoringCriteria
    .map((c) => `${c.letter} ${scores[c.key]}/${c.weight}`)
    .join(" · ");
}
