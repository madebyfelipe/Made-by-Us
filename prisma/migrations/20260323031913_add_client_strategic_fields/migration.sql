-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "contentFrequency" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "differentials" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mainObjective" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "niche" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "operationalGuidelines" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "platforms" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "restrictions" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "targetAudience" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "toneOfVoice" TEXT NOT NULL DEFAULT '';
