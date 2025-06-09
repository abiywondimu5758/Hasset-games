/*
  Warnings:

  - You are about to drop the `UserStatistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserStatistics" DROP CONSTRAINT "UserStatistics_userId_fkey";

-- DropTable
DROP TABLE "UserStatistics";

-- CreateTable
CREATE TABLE "Statistics" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Statistics" ADD CONSTRAINT "Statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
