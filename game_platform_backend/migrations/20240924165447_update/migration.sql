/*
  Warnings:

  - You are about to drop the column `cardNumber` on the `UserBingoCard` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `UserBingoCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBingoCard" DROP COLUMN "cardNumber",
ADD COLUMN     "cardId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserBingoCard" ADD CONSTRAINT "UserBingoCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "BingoCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
