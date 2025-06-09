-- DropForeignKey
ALTER TABLE "BingoFee" DROP CONSTRAINT "BingoFee_gameId_fkey";

-- DropForeignKey
ALTER TABLE "BingoFee" DROP CONSTRAINT "BingoFee_userId_fkey";

-- AlterTable
ALTER TABLE "DailyBingoFeeAggregate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "BingoFee" ADD CONSTRAINT "BingoFee_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BingoGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BingoFee" ADD CONSTRAINT "BingoFee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
