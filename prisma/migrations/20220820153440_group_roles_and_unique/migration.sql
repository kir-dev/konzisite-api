/*
  Warnings:

  - A unique constraint covering the columns `[consultationId,userId]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[consultationId,userId]` on the table `Presentation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[participationId,presentationId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('PENDING', 'MEMBER', 'ADMIN', 'OWNER', 'NONE');

-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "ConsultationRequest" DROP CONSTRAINT "ConsultationRequest_initializerId_fkey";

-- DropForeignKey
ALTER TABLE "ConsultationRequest" DROP CONSTRAINT "ConsultationRequest_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_consultationId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Presentation" DROP CONSTRAINT "Presentation_consultationId_fkey";

-- DropForeignKey
ALTER TABLE "Presentation" DROP CONSTRAINT "Presentation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_participationId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_presentationId_fkey";

-- DropForeignKey
ALTER TABLE "UserToGroup" DROP CONSTRAINT "UserToGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserToGroup" DROP CONSTRAINT "UserToGroup_userId_fkey";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserToGroup" ADD COLUMN     "role" "GroupRole" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE UNIQUE INDEX "Participation_consultationId_userId_key" ON "Participation"("consultationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Presentation_consultationId_userId_key" ON "Presentation"("consultationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_participationId_presentationId_key" ON "Rating"("participationId", "presentationId");

-- AddForeignKey
ALTER TABLE "UserToGroup" ADD CONSTRAINT "UserToGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToGroup" ADD CONSTRAINT "UserToGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_initializerId_fkey" FOREIGN KEY ("initializerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
