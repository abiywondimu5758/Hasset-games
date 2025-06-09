-- CreateTable
CREATE TABLE "Winner" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bonusPeriodId" INTEGER NOT NULL,
    "amountWon" DECIMAL(65,30) NOT NULL,
    "rank" INTEGER NOT NULL,
    "prizeGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prizeGivenDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Winner_userId_bonusPeriodId_key" ON "Winner"("userId", "bonusPeriodId");

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES "BonusPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
