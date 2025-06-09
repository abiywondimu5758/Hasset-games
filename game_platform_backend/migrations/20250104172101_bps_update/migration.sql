-- CreateEnum
CREATE TYPE "PrizeDistribution" AS ENUM ('PREDEFINED', 'RANDOM', 'BOTH');

-- AlterTable
ALTER TABLE "BonusPeriod" ADD COLUMN     "predefinedWinners" INTEGER,
ADD COLUMN     "prizeDistribution" "PrizeDistribution" NOT NULL DEFAULT 'PREDEFINED';

-- AlterTable
ALTER TABLE "Winner" ALTER COLUMN "prizeGivenDate" DROP NOT NULL,
ALTER COLUMN "prizeGivenDate" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Prize" (
    "id" SERIAL NOT NULL,
    "bonusPeriodId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prize_bonusPeriodId_rank_key" ON "Prize"("bonusPeriodId", "rank");

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES "BonusPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
