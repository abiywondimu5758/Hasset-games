/*
  Warnings:

  - You are about to drop the `BingoCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserBingoCard" DROP CONSTRAINT "UserBingoCard_cardId_fkey";

-- DropTable
DROP TABLE "BingoCard";
