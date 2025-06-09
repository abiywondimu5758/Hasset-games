-- CreateTable
CREATE TABLE "BingoCard" (
    "id" SERIAL NOT NULL,
    "numbers" TEXT NOT NULL,

    CONSTRAINT "BingoCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBingoCard" ADD CONSTRAINT "UserBingoCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "BingoCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
