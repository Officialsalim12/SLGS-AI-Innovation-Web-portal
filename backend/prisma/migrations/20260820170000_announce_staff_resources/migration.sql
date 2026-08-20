-- AlterEnum
ALTER TYPE "ChatChannel" ADD VALUE IF NOT EXISTS 'staff';

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "audience" TEXT NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "announcements_audience_idx" ON "announcements"("audience");

-- CreateTable
CREATE TABLE IF NOT EXISTS "judge_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_resources_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "judge_resources_createdAt_idx" ON "judge_resources"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'judge_resources_authorId_fkey'
  ) THEN
    ALTER TABLE "judge_resources"
      ADD CONSTRAINT "judge_resources_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
