-- AlterTable
ALTER TABLE "DailyBingoFeeAggregate" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ReferredUser" ADD COLUMN     "bonusAwarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalDeposit" DECIMAL(65,30) NOT NULL DEFAULT 0.00;
