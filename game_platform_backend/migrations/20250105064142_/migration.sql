/*
  Warnings:

  - A unique constraint covering the columns `[userId,bonusPeriodId,rank]` on the table `Winner` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Winner_userId_bonusPeriodId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Winner_userId_bonusPeriodId_rank_key" ON "Winner"("userId", "bonusPeriodId", "rank");
