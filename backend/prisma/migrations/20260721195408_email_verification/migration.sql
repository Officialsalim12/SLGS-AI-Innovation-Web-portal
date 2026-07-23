-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationCodeHash" TEXT;
