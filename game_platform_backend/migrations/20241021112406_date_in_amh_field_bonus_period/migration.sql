/*
  Warnings:

  - Added the required column `dateTimeInAMH` to the `BonusPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BonusPeriod" ADD COLUMN     "dateTimeInAMH" TEXT NOT NULL;
