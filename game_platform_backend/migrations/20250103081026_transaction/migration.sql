-- AlterTable
ALTER TABLE "User" ALTER COLUMN "wallet" SET DEFAULT 10.00;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "charge" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "failure_reason" TEXT,
    "mode" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "tx_ref" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "customization" JSONB NOT NULL,
    "meta" JSONB NOT NULL,
    "userWalletUpdated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_tx_ref_key" ON "Transaction"("tx_ref");
