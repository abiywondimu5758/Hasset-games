-- CreateTable
CREATE TABLE "Stake" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BingoGame" (
    "id" SERIAL NOT NULL,
    "stakeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "countdownStart" TIMESTAMP(3),
    "countdownEnd" TIMESTAMP(3),
    "possibleWin" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "BingoGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBingoCard" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBingoCard_pkey" PRIMARY KEY ("userId","gameId")
);

-- CreateTable
CREATE TABLE "UserStatistics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "amountWon" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dailyStats" JSONB NOT NULL DEFAULT '{}',
    "weeklyStats" JSONB NOT NULL DEFAULT '{}',
    "monthlyStats" JSONB NOT NULL DEFAULT '{}',
    "yearlyStats" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "UserStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameStakes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserGamesPlayed" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserGamesWon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserGamesLost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GameStakes_AB_unique" ON "_GameStakes"("A", "B");

-- CreateIndex
CREATE INDEX "_GameStakes_B_index" ON "_GameStakes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserGamesPlayed_AB_unique" ON "_UserGamesPlayed"("A", "B");

-- CreateIndex
CREATE INDEX "_UserGamesPlayed_B_index" ON "_UserGamesPlayed"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserGamesWon_AB_unique" ON "_UserGamesWon"("A", "B");

-- CreateIndex
CREATE INDEX "_UserGamesWon_B_index" ON "_UserGamesWon"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserGamesLost_AB_unique" ON "_UserGamesLost"("A", "B");

-- CreateIndex
CREATE INDEX "_UserGamesLost_B_index" ON "_UserGamesLost"("B");

-- AddForeignKey
ALTER TABLE "BingoGame" ADD CONSTRAINT "BingoGame_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "Stake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBingoCard" ADD CONSTRAINT "UserBingoCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBingoCard" ADD CONSTRAINT "UserBingoCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BingoGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatistics" ADD CONSTRAINT "UserStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameStakes" ADD CONSTRAINT "_GameStakes_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameStakes" ADD CONSTRAINT "_GameStakes_B_fkey" FOREIGN KEY ("B") REFERENCES "Stake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesPlayed" ADD CONSTRAINT "_UserGamesPlayed_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesPlayed" ADD CONSTRAINT "_UserGamesPlayed_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesWon" ADD CONSTRAINT "_UserGamesWon_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesWon" ADD CONSTRAINT "_UserGamesWon_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesLost" ADD CONSTRAINT "_UserGamesLost_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGamesLost" ADD CONSTRAINT "_UserGamesLost_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
