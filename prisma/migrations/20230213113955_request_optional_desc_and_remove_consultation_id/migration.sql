/*
  Warnings:

  - You are about to drop the column `consultationId` on the `ConsultationRequest` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ConsultationRequest_consultationId_key";

-- AlterTable
ALTER TABLE "ConsultationRequest" DROP COLUMN "consultationId",
ALTER COLUMN "descMarkdown" DROP NOT NULL;
