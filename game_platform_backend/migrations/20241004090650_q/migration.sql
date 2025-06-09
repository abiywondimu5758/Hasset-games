/*
  Warnings:

  - Added the required column `updatedAt` to the `UserStatistics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserStatistics" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
