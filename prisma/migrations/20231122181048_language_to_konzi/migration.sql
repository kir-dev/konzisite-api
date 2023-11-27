-- CreateEnum
CREATE TYPE "Language" AS ENUM ('hu', 'en');

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'hu';
