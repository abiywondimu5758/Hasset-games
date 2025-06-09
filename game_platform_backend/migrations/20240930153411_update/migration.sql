/*
  Warnings:

  - Added the required column `markedNumbers` to the `UserBingoCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBingoCard" ADD COLUMN     "markedNumbers" TEXT NOT NULL;
