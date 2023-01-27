/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Consultation" ALTER COLUMN "descMarkdown" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
