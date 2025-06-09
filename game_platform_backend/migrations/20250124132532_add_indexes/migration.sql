-- CreateIndex
CREATE INDEX "BingoGame_stakeId_idx" ON "BingoGame"("stakeId");

-- CreateIndex
CREATE INDEX "BingoGame_hasEnded_idx" ON "BingoGame"("hasEnded");

-- CreateIndex
CREATE INDEX "BingoGame_active_idx" ON "BingoGame"("active");

-- CreateIndex
CREATE INDEX "BonusPeriod_startDate_idx" ON "BonusPeriod"("startDate");

-- CreateIndex
CREATE INDEX "BonusPeriod_endDate_idx" ON "BonusPeriod"("endDate");

-- CreateIndex
CREATE INDEX "BonusPeriod_type_idx" ON "BonusPeriod"("type");

-- CreateIndex
CREATE INDEX "BonusPoint_userId_bonusPeriodId_idx" ON "BonusPoint"("userId", "bonusPeriodId");

-- CreateIndex
CREATE INDEX "Game_title_idx" ON "Game"("title");

-- CreateIndex
CREATE INDEX "Prize_bonusPeriodId_rank_idx" ON "Prize"("bonusPeriodId", "rank");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Stake_amount_idx" ON "Stake"("amount");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_tx_ref_idx" ON "Transaction"("tx_ref");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "UserBingoCard_userId_idx" ON "UserBingoCard"("userId");

-- CreateIndex
CREATE INDEX "UserStatistics_userId_idx" ON "UserStatistics"("userId");

-- CreateIndex
CREATE INDEX "Winner_userId_bonusPeriodId_rank_idx" ON "Winner"("userId", "bonusPeriodId", "rank");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");
