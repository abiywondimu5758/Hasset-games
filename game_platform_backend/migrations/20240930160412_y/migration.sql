/*
  Warnings:

  - The primary key for the `UserBingoCard` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserBingoCard" DROP CONSTRAINT "UserBingoCard_pkey",
ADD CONSTRAINT "UserBingoCard_pkey" PRIMARY KEY ("userId", "gameId", "cardId");
