/*
  Warnings:

  - A unique constraint covering the columns `[startDate,endDate,type]` on the table `BonusPeriod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,bonusPeriodId]` on the table `BonusPoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BonusPeriod_startDate_endDate_type_key" ON "BonusPeriod"("startDate", "endDate", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BonusPoint_userId_bonusPeriodId_key" ON "BonusPoint"("userId", "bonusPeriodId");
