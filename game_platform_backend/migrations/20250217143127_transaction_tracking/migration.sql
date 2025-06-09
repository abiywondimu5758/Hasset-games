-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAggregate" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransactionAggregate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deposit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "withdrawal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransactionAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBingoFeeAggregate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyBingoFeeAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BingoFee" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BingoFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransactionAggregate_date_key" ON "WalletTransactionAggregate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBingoFeeAggregate_date_key" ON "DailyBingoFeeAggregate"("date");

-- CreateIndex
CREATE INDEX "BingoFee_gameId_idx" ON "BingoFee"("gameId");

-- CreateIndex
CREATE INDEX "BingoFee_userId_idx" ON "BingoFee"("userId");

-- CreateIndex
CREATE INDEX "BingoFee_createdAt_idx" ON "BingoFee"("createdAt");

-- AddForeignKey
ALTER TABLE "BingoFee" ADD CONSTRAINT "BingoFee_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BingoGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BingoFee" ADD CONSTRAINT "BingoFee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
