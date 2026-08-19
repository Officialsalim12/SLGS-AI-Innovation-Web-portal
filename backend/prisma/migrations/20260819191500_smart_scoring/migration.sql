-- Switch judging from the four old criteria to SMART (20 pts each).
ALTER TABLE "scores"
  ADD COLUMN "specific" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "measurable" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "achievable" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "relevant" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "timeBound" INTEGER NOT NULL DEFAULT 0;

UPDATE "scores" SET
  "specific" = LEAST(20, "presentation"),
  "measurable" = LEAST(20, ROUND(("solutionDevelopment"::numeric * 20) / 40)::integer),
  "achievable" = LEAST(20, ROUND(("solutionDevelopment"::numeric * 20) / 40)::integer),
  "relevant" = LEAST(20, ROUND(("challengeRequirements"::numeric * 20) / 25)::integer),
  "timeBound" = LEAST(20, "communication");

UPDATE "scores" SET
  "total" = "specific" + "measurable" + "achievable" + "relevant" + "timeBound";

ALTER TABLE "scores"
  DROP COLUMN "solutionDevelopment",
  DROP COLUMN "challengeRequirements",
  DROP COLUMN "presentation",
  DROP COLUMN "communication";
