-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('info', 'warning', 'error', 'success');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AlertType" NOT NULL DEFAULT 'info',
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);
