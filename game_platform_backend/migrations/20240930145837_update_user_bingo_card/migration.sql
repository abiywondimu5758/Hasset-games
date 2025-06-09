-- DropForeignKey
ALTER TABLE "UserBingoCard" DROP CONSTRAINT "UserBingoCard_cardId_fkey";

-- AddForeignKey
ALTER TABLE "UserBingoCard" ADD CONSTRAINT "UserBingoCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "BingoCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
