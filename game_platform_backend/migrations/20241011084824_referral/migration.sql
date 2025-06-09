/*
  Warnings:

  - You are about to drop the column `referralCode` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_referralCode_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referralCode",
ADD COLUMN     "referralBonus" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
ADD COLUMN     "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
