/*
  Warnings:

  - Added the required column `name` to the `ConsultationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConsultationRequest" DROP CONSTRAINT "ConsultationRequest_consultationId_fkey";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "requestId" INTEGER;

-- AlterTable
ALTER TABLE "ConsultationRequest" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ConsultationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
