/*
  Warnings:

  - You are about to drop the column `cardId` on the `UserBingoCard` table. All the data in the column will be lost.
  - Added the required column `cardNumber` to the `UserBingoCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserBingoCard" DROP CONSTRAINT "UserBingoCard_cardId_fkey";

-- AlterTable
ALTER TABLE "UserBingoCard" DROP COLUMN "cardId",
ADD COLUMN     "cardNumber" TEXT NOT NULL;
