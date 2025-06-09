-- AlterTable
ALTER TABLE "BonusPeriod" ADD COLUMN     "allowedStakes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "minDeposit" DECIMAL(65,30),
ADD COLUMN     "minGames" INTEGER;

-- CreateTable
CREATE TABLE "BonusPeriodParticipation" (
    "id" SERIAL NOT NULL,
    "bonusPeriodId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "stakeIds" INTEGER[],

    CONSTRAINT "BonusPeriodParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BonusPeriodParticipation_userId_idx" ON "BonusPeriodParticipation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BonusPeriodParticipation_bonusPeriodId_userId_key" ON "BonusPeriodParticipation"("bonusPeriodId", "userId");

-- AddForeignKey
ALTER TABLE "BonusPeriodParticipation" ADD CONSTRAINT "BonusPeriodParticipation_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES "BonusPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusPeriodParticipation" ADD CONSTRAINT "BonusPeriodParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
