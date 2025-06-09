/*
  Warnings:

  - A unique constraint covering the columns `[userId,gameId]` on the table `UserBingoCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBingoCard_userId_gameId_key" ON "UserBingoCard"("userId", "gameId");
