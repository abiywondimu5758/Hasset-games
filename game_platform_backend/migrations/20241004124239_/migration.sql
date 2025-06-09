/*
  Warnings:

  - You are about to alter the column `amountWon` on the `UserStatistics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "UserStatistics" ALTER COLUMN "amountWon" SET DATA TYPE DOUBLE PRECISION;
