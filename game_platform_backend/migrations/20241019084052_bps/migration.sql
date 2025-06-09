-- CreateTable
CREATE TABLE "BonusPeriod" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusPoint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bonusPeriodId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusPoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BonusPoint" ADD CONSTRAINT "BonusPoint_bonusPeriodId_fkey" FOREIGN KEY ("bonusPeriodId") REFERENCES "BonusPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusPoint" ADD CONSTRAINT "BonusPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
