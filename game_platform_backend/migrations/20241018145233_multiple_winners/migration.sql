/*
  Warnings:

  - You are about to drop the column `winner` on the `BingoGame` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BingoGame" DROP COLUMN "winner",
ADD COLUMN     "declaredWinners" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
