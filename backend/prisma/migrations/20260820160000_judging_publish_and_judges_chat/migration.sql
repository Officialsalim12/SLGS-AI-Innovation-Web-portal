-- AlterEnum
ALTER TYPE "ChatChannel" ADD VALUE IF NOT EXISTS 'judges';

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "scoresPublishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_messages" ALTER COLUMN "teamId" DROP NOT NULL;
