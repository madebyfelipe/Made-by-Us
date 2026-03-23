-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('POST', 'STORY', 'REELS', 'CAROUSEL', 'ADS');

-- CreateEnum
CREATE TYPE "Effort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProductionStage" AS ENUM ('ROTEIRO', 'DESIGN', 'EDICAO', 'REVISAO', 'APROVACAO');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "contentType" "ContentType",
ADD COLUMN     "cta" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "effort" "Effort",
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "stage" "ProductionStage";
