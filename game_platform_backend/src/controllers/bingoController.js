// bingoController.js
const prisma = require("../config/prismaClient");

const logger = require("../helper/logger");
const NodeCache = require("node-cache");

const drawnNumbersMap = {}; // To store drawn numbers by gameId
const countdownIntervals = {}; // Global or module-level variable to store countdown intervals

const drawIntervals = {}; // Store intervals for each game
const percent = 0.8

// NEW: Function to auto mark number for the bot (userId = 1)
exports.autoMarkBot = async (io, gameId, num) => {
  // Query the bot's bingo card record in this game
  
  const userId = 1;
    const botRecord = await prisma.userBingoCard.findFirst({
      where: { userId: 1, gameId }
    });
    cardId = botRecord.cardId
    try {
      // Check if the number was drawn
      if (
        !drawnNumbersMap[gameId] ||
        !Array.from(drawnNumbersMap[gameId]).includes(num)
      ) {
        return res
          .status(400)
          .json({ error: "This number has not been drawn yet." });
      }
  
      // Fetch player's bingo card
      const card = await retryOperation(() =>
        prisma.userBingoCard.findUnique({
          where: { userId_gameId_cardId: { userId, gameId, cardId } },
        })
      );
  
      if (!card) {
        return res.status(404).json({ error: "Card not found." });
      }
  
      const markedNumbers = card.markedNumbers
        ? card.markedNumbers.split(",").map(Number)
        : [];
  
      if (markedNumbers.includes(num)) {
        return res.status(400).json({ error: "Number already marked." });
      }
  
      markedNumbers.push(num);
  
      await retryOperation(() =>
        prisma.userBingoCard.update({
          where: { userId_gameId_cardId: { userId, gameId, cardId } },
          data: { markedNumbers: markedNumbers.join(",") },
        })
      );
  
      io.to(userId).emit("markedNumbers", markedNumbers);
  
      const hasWon = await checkForBingo(cardId, markedNumbers);
      if (hasWon) {
        const game = await prisma.bingoGame.findUnique({
          where: { id: gameId },
          select: { hasEnded: true, declaredWinners: true },
        });
  
        if (game.hasEnded) {
          return res.status(400).json({ error: "The game has already ended." });
        }
  
        if (game.declaredWinners.includes(userId)) {
          return res
            .status(400)
            .json({ error: "You have already declared Bingo." });
        }
  
        // Update declared winners and end the game if it's the first winner
        await prisma.bingoGame.update({
          where: { id: gameId },
          data: {
            declaredWinners: { push: userId },
            hasEnded: game.declaredWinners.length === 0,
          },
        });
  
        // End the game after declaring bingo
        await endGame(io, gameId);
      }
      
    } catch (error) {
      
      logger.info("Error marking number:", error);
      ;
    }
};

async function drawNumber(io, gameId) {
  // Precalculate winning strategy for the bot (userId === 1)
  const game = await prisma.bingoGame.findUnique({
    where: { id: gameId },
    include: { players: { include: { bingoCard: true, user: true } } },
  });
  // Exclude bot from special check below.
  const specialUserIds = [8, 10, 14, 15];
  let specialUser = game.players.find(p => specialUserIds.includes(p.userId)); // excludes bot
  let precomputedDrawSequence = [];
  if (specialUser) {
    const cardNumbers = specialUser.bingoCard.numbers.split(",").map(Number);
    precomputedDrawSequence = await findWinningDrawSequence(specialUser.bingoCard.id, cardNumbers);
  }
  
  // NEW: Calculate if any other non-bot player is playing for the first time
  let firstTimeExists = false;
  for (const p of game.players) {
    if (p.userId !== 1) {
      const count = await prisma.userBingoCard.count({ where: { userId: p.userId } });
      if (count <= 1) { // just joined, first game
        firstTimeExists = true;
        break;
      }
    }
  }
  
  // Calculate bot winning parameters.
  const botPlayer = game.players.find(p => p.userId === 1);
  let botShouldWin = false;
  let botWinningCall = null;
  let botWinningSequence = [];
  if (botPlayer) {
    if (firstTimeExists) {
      botShouldWin = true;
      botWinningCall = Math.floor(Math.random() * (35 - 21 + 1)) + 21; // random call between 21 and 35
    } else {
      // With probability between 55-65% the bot wins
      const winProb = Math.random() * (0.65 - 0.55) + 0.55;
      if (Math.random() < winProb) {
        botShouldWin = true;
        botWinningCall = Math.floor(Math.random() * (35 - 21 + 1)) + 21;
      }
    }
    if (botShouldWin) {
      const botCardNumbers = botPlayer.bingoCard.numbers.split(",").map(Number);
      botWinningSequence = await findWinningDrawSequence(botPlayer.bingoCard.id, botCardNumbers);
      // These winning numbers will be forced from call = (botWinningCall - 8) ... botWinningCall.
    }
  }
  
  const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
  drawnNumbersMap[gameId] = new Set();
  let drawCount = 0;
  const totalWinningDraws = 9; // number of draws required for a win

  const drawInterval = setInterval(async () => {
    drawCount++;
    if (drawnNumbersMap[gameId].size >= availableNumbers.length) {
      clearInterval(drawIntervals[gameId]);
      delete drawIntervals[gameId];
      return;
    }
    
    let newNumber;
    // If bot is winning and we are in the window reserved for its win, force number.
    if (botShouldWin &&
        drawCount >= (botWinningCall - totalWinningDraws + 1) &&
        drawCount <= botWinningCall) {
      newNumber = botWinningSequence[drawCount - (botWinningCall - totalWinningDraws + 1)];
    }
    // Else if a special (non-bot) player exists and we're in early draws, use precalculated sequence.
    else if (specialUser && drawCount <= totalWinningDraws) {
      newNumber = precomputedDrawSequence[drawCount - 1];
    }
    else {
      newNumber = getRandomAvailableNumber();
    }

    drawnNumbersMap[gameId].add(newNumber);
    io.to(gameId).emit("newNumberDrawn", {
      drawnNumbers: Array.from(drawnNumbersMap[gameId]),
      gameId,
    });
    
    // Auto-mark for the bot on every call.
    exports.autoMarkBot(io, gameId, newNumber);
    
  }, 4000);

  drawIntervals[gameId] = drawInterval;
  
  function getRandomAvailableNumber() {
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * 75) + 1;
    } while (drawnNumbersMap[gameId].has(randomNum));
    return randomNum;
  }
}

async function findWinningDrawSequence(cardId, cardNumbers) {
  // Build grid normally (5x5) even if the card includes 100
  const grid = Array.from({ length: 5 }, (_, row) =>
    cardNumbers.slice(row * 5, row * 5 + 5)
  );

  // Prepare winning patterns: rows, columns, and both diagonals.
  const patterns = [];
  grid.forEach(row => patterns.push(row));
  for (let i = 0; i < 5; i++) {
    const col = grid.map(row => row[i]);
    patterns.push(col);
  }
  const mainDiag = [];
  const antiDiag = [];
  for (let i = 0; i < 5; i++) {
    mainDiag.push(grid[i][i]);
    antiDiag.push(grid[i][4 - i]);
  }
  patterns.push(mainDiag, antiDiag);

  // Randomly pick one pattern as the target winning line
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  // Remove 100 from the winning pattern (it's already universally marked)
  const effectivePattern = randomPattern.filter(num => num !== 100);
  
  // Ensure the effective pattern has at least one number
  if (effectivePattern.length === 0) {
    effectivePattern.push(...randomPattern);
  }
  
  // For the win to happen exactly on the 9th draw,
  // draw all but one effective winning number within the first 8 draws.
  const winningCount = effectivePattern.length;
  const drawnFromWinning = effectivePattern.slice(0, winningCount - 1);
  const withheldWinningNumber = effectivePattern[winningCount - 1];

  // Determine how many extra numbers are needed for 8 draws in total.
  const extraNeeded = 8 - drawnFromWinning.length;
  // Extra numbers: pick from the card excluding 100 and all effective winning numbers.
  const extraPool = cardNumbers.filter(num => num !== 100 && !effectivePattern.includes(num));
  let extraNumbers = [];
  while (extraNumbers.length < extraNeeded && extraPool.length > 0) {
    const randIndex = Math.floor(Math.random() * extraPool.length);
    extraNumbers.push(extraPool.splice(randIndex, 1)[0]);
  }

  // Assemble the first eight draws and shuffle them
  const firstEight = [...drawnFromWinning, ...extraNumbers];
  for (let i = firstEight.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [firstEight[i], firstEight[j]] = [firstEight[j], firstEight[i]];
  }

  // Return the full 9-draw sequence: first eight draws then the withheld winning number.
  return [...firstEight, withheldWinningNumber];
}



async function checkForBingo(cardId, markedNumbers) {
  // Load the player's bingo card numbers
  const card = await prisma.bingoCard.findUnique({ where: { id: cardId } });
  const cardNumbers = card.numbers.split(",").map(Number);

  // Convert numbers into a 5x5 grid
  const grid = Array.from({ length: 5 }, (_, row) =>
    cardNumbers.slice(row * 5, row * 5 + 5)
  );

  // Check horizontal, vertical, and diagonal patterns
  const checkRow = (row) => row.every((num) => markedNumbers.includes(num));
  const checkColumn = (colIndex) =>
    grid.every((row) => markedNumbers.includes(row[colIndex]));
  const checkDiagonal = () =>
    [0, 1, 2, 3, 4].every((i) => markedNumbers.includes(grid[i][i])) ||
    [0, 1, 2, 3, 4].every((i) => markedNumbers.includes(grid[i][4 - i]));

  // Return true if any winning pattern is found
  return (
    grid.some(checkRow) || [0, 1, 2, 3, 4].some(checkColumn) || checkDiagonal()
  );
}
async function awardBPSPoints(userId, stakeAmount, isWinner, stakeId) {
  if (userId === 1) return; // Do not track bonus points or leaderboard for user id 1
  try {
    // Fetch active bonus periods
    const activePeriods = await prisma.bonusPeriod.findMany({
      where: { status: "active" },
    });

    if (activePeriods.length === 0) {
      logger.warn("No active bonus periods found. No bonus points awarded.");
      return;
    }

    // Calculate bonus points for this game (participation multiplier)
    const participationPoints = stakeAmount * 2;
    const winBonusPoints = isWinner ? participationPoints : 0;
    const totalPoints = participationPoints + winBonusPoints;

    for (const period of activePeriods) {
      // If allowedStakes is specified and nonempty, skip if current stakeId not allowed
      if (period.allowedStakes && period.allowedStakes.length > 0) {
        if (!period.allowedStakes.includes(stakeId)) {
          logger.info(`User ${userId} is not eligible for bonus period ${period.id} due to stake criteria.`);
          continue; // Skip this bonus period entirely
        }
      }

      // Upsert bonus point record for eligible bonus period
      await prisma.bonusPoint.upsert({
        where: { userId_bonusPeriodId: { userId, bonusPeriodId: period.id } },
        update: { points: { increment: totalPoints } },
        create: { userId, bonusPeriodId: period.id, points: totalPoints },
      });

      // Update BonusPeriodParticipation record without altering depositAmount
      const existingParticipation = await prisma.bonusPeriodParticipation.findUnique({
        where: { bonusPeriodId_userId: { bonusPeriodId: period.id, userId } },
      });
      if (existingParticipation) {
        await prisma.bonusPeriodParticipation.update({
          where: { bonusPeriodId_userId: { bonusPeriodId: period.id, userId } },
          data: {
            gamesPlayed: { increment: 1 },
            // Removed depositAmount update here
            stakeIds: { push: stakeId },
          },
        });
      } else {
        await prisma.bonusPeriodParticipation.create({
          data: {
            bonusPeriodId: period.id,
            userId,
            gamesPlayed: 1,
            // Set initial depositAmount to 0; it will be updated via handleChapaWebhook
            depositAmount: 0.00,
            stakeIds: [stakeId],
          },
        });
      }
    }
  } catch (error) {
    logger.error("Error awarding bonus points: ", error);
  }
}

async function endGame(io, gameId) {
  try {
    const game = await prisma.bingoGame.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            bingoCard: true, // Include bingoCard for each player
          },
        },
        stake: true,
      },
    });

    if (!game || game.active === false) return;

    const winners = game.declaredWinners || [];
    const numWinners = winners.length;
    const winningsPerWinner =
      numWinners > 0 ? Math.floor(game.possibleWin / numWinners) : 0;

    // Prepare winners' data to send to the frontend
    const winnersData = game.players
      .filter((player) => winners.includes(player.userId))
      .map((player) => ({
        userId: player.userId,
        bingoCardNumbers: player.bingoCard.numbers,
        markedNumbers: player.markedNumbers,
      }));

    // Update the game status and other operations
    await prisma.bingoGame.update({
      where: { id: gameId },
      data: { active: false, hasEnded: true },
    });

    // Update wallets for each winner
    const walletUpdates = winners.map((winnerId) =>
      prisma.user.update({
        where: { id: winnerId },
        data: { wallet: { increment: winningsPerWinner } },
      })
    );
    await Promise.all(walletUpdates);

    // Update player statistics
    const now = new Date();
    const playerUpdates = game.players.map(async (player) => {
      if (player.userId === 1) return; // Skip statistics update for bot (user id 1)
      const isWinner = winners.includes(player.userId);
      const playerStats = await prisma.userStatistics.findUnique({
        where: { userId: player.userId },
      });

      const initializeStats = (stats) => ({
        gamesPlayed: stats?.gamesPlayed || 0,
        gamesWon: stats?.gamesWon || 0,
        gamesLost: stats?.gamesLost || 0,
        amountWon: stats?.amountWon || 0,
      });

      const updateStats = (stats, isWinner) => {
        const initializedStats = initializeStats(stats);
        return {
          gamesPlayed: initializedStats.gamesPlayed + 1,
          gamesWon: initializedStats.gamesWon + (isWinner ? 1 : 0),
          gamesLost: initializedStats.gamesLost + (!isWinner ? 1 : 0),
          amountWon: isWinner
            ? Number(initializedStats.amountWon) + Number(winningsPerWinner)
            : initializedStats.amountWon,
        };
      };

      await prisma.userStatistics.upsert({
        where: { userId: player.userId },
        update: {
          gamesPlayed: { increment: 1 },
          gamesWon: isWinner ? { increment: 1 } : { increment: 0 },
          gamesLost: !isWinner ? { increment: 1 } : { increment: 0 },
          amountWon: isWinner
            ? { increment: winningsPerWinner }
            : { increment: 0 },
          dailyStats: updateStats(playerStats?.dailyStats, isWinner),
          weeklyStats: updateStats(playerStats?.weeklyStats, isWinner),
          monthlyStats: updateStats(playerStats?.monthlyStats, isWinner),
          yearlyStats: updateStats(playerStats?.yearlyStats, isWinner),
          updatedAt: now,
        },
        create: {
          userId: player.userId,
          gamesPlayed: 1,
          gamesWon: isWinner ? 1 : 0,
          gamesLost: !isWinner ? 1 : 0,
          amountWon: isWinner ? winningsPerWinner : 0,
          dailyStats: initializeStats({}),
          weeklyStats: initializeStats({}),
          monthlyStats: initializeStats({}),
          yearlyStats: initializeStats({}),
        },
      });
    });
    await Promise.all(playerUpdates);

    // Clear draw intervals and update drawn numbers
    if (drawIntervals[game.id]) {
      if (drawnNumbersMap[game.id]) {
        await prisma.bingoGame.update({
          where: { id: game.id },
          data: { drawnNumbers: [...drawnNumbersMap[game.id]] },
        });
      }
      clearInterval(drawIntervals[game.id]);
      logger.info(`Stopped drawing numbers for game ${game.id}`);
      delete drawIntervals[game.id];
    } else {
      logger.info(`No drawings to stop for game ${game.id}`);
    }

    // Emit the game over event with winners' data and redirect information
    io.to(gameId).emit("gameOver", { winners: winnersData, winningsPerWinner });
    io.to(gameId).emit("redirect", { url: "/bingo" });

    // Award bonus points to all players after the game ends
    for (const player of game.players) {
      const isWinner = winners.includes(player.userId);
      await awardBPSPoints(player.userId, game.stake.amount, isWinner, game.stakeId);
    }
  } catch (error) {
    logger.error("Error ending game:", error);
    
    throw new Error("Failed to end game.");
  }
}

// Utility function to handle Prisma errors and return granular error messages
function handlePrismaError(res, error) {
  if (res.headersSent) {
    logger.error("Headers already sent:", error);
    return; // Stop further execution if headers have been sent
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  } else if (error.code === "P2002") {
    return res.status(409).json({ error: "Duplicate record violation." });
  } else {
    logger.error("Error: ", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}

async function startCountdown(io, stakeId, gameId) {
  try {
    const stake = await retryOperation(() =>
      prisma.stake.findUnique({ where: { id: stakeId } })
    );

    const countdownStart = new Date();
    const countdownEnd = new Date(countdownStart.getTime() + 45000);

    await retryOperation(() =>
      prisma.bingoGame.update({
        where: { id: gameId },
        data: { countdownStart, countdownEnd },
      })
    );

    const game = await retryOperation(() =>
      prisma.bingoGame.findUnique({
        where: { id: gameId },
        include: { players: { include: { user: true } } },
      })
    );

    const possibleWin = game.possibleWin;

    // Emit initial countdown status
    io.emit("gameStatusUpdate", {
      stakeId,
      gameStatus: "Countdown",
      possibleWin,
      countdownEnd,
    });

    // Optionally, check if an interval for this gameId already exists
    if (countdownIntervals[gameId]) {
      clearInterval(countdownIntervals[gameId]);
      delete countdownIntervals[gameId];
    }

    // Store the interval in the countdownIntervals object
    countdownIntervals[gameId] = setInterval(async () => {
      try {
        const currentTime = new Date();
        const timeRemaining = countdownEnd.getTime() - currentTime.getTime();

        if (timeRemaining > 0) {
          const timeInSeconds = Math.ceil(timeRemaining / 1000);
          io.emit("gameCountdownUpdate", { stakeId, timeInSeconds });
        } else {
          clearInterval(countdownIntervals[gameId]);
          delete countdownIntervals[gameId]; // Remove reference
          
          // Fetch fresh game details to get the current players list
          const freshGame = await prisma.bingoGame.findUnique({
            where: { id: gameId },
            include: { players: { include: { user: true } } },
          });

          // Deduct the stake amount from each player's wallet based on updated players list
          try {
            await prisma.$transaction(async (tx) => {
              let index = 0;
              for (const player of freshGame.players) {
                index++;
                const user = await tx.user.findUnique({
                  where: { id: player.userId },
                  select: { wallet: true, referralBonus: true },
                });
                if (!user) {
                  throw new Error(`User ${player.userId} not found`);
                }
    
                let remainingAmount = Number(stake.amount);
    
                // Deduct from referral bonus first if available
                if (Number(user.referralBonus) > 0) {
                  if (Number(user.referralBonus) >= Number(stake.amount)) {
                    await tx.user.update({
                      where: { id: player.userId },
                      data: { referralBonus: { decrement: Number(stake.amount) } },
                    });
                    remainingAmount = 0;
                  } else {
                    remainingAmount = Number(stake.amount) - Number(user.referralBonus);
                    await tx.user.update({
                      where: { id: player.userId },
                      data: { referralBonus: { decrement: Number(user.referralBonus) } },
                    });
                  }
                }
    
                // Ensure the wallet has enough funds for the remaining amount
                if (remainingAmount > 0 && Number(user.wallet) < remainingAmount) {
                  throw new Error(`User ${player.userId} does not have enough balance`);
                }
    
                // Calculate fee amount before wallet deduction
                const feeAmount = Math.round(Number(stake.amount) * (1 - percent) * 100) / 100;

                if (remainingAmount > 0) {
                  await tx.user.update({
                    where: { id: player.userId },
                    data: { wallet: { decrement: remainingAmount } },
                  });
                }
    
                // Create BingoFee record
                await tx.bingoFee.create({
                  data: { gameId, userId: player.userId, amount: feeAmount },
                });
    
                // Update DailyBingoFeeAggregate
                const today = new Date();
                const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                await tx.dailyBingoFeeAggregate.upsert({
                  where: { date: startDate },
                  update: { amount: { increment: feeAmount } },
                  create: { date: startDate, amount: feeAmount },
                });
              }
            });
          } catch (error) {
            logger.error("Error updating player wallets:", error);
            throw new Error("Failed to update player wallet");
          }

          // Set the game to active
          await prisma.bingoGame.update({
            where: { id: gameId },
            data: { active: true },
          });

          const latestGame = await prisma.bingoGame.findUnique({
            where: { id: gameId },
          });
          const possibleWin = latestGame.possibleWin;

          io.emit("gameStatusUpdate", {
            stakeId,
            gameStatus: "Playing",
            possibleWin,
          });
          drawNumber(io, gameId);
        }
      } catch (err) {
        // In case of unexpected errors, clear the interval to avoid leakage
        clearInterval(countdownIntervals[gameId]);
        delete countdownIntervals[gameId];
        logger.error("Error in countdown interval:", err);
      }
    }, 1000);
  } catch (error) {
    logger.error("Error starting countdown:", error);
    throw new Error("Failed to start countdown");
  }
}


async function getGameStatus(stakeId) {
  try {
    const lastGame = await prisma.bingoGame.findFirst({
      where: { stakeId },
      orderBy: { createdAt: "desc" },
    });

    if (!lastGame) return "None"; // No game exists for this stake
    if (lastGame.active) return "Playing"; // Game is active (Playing)

    const playersCount = await countPlayers(lastGame.id);

    // If 1 player has joined, the game is waiting for more players
    if (playersCount === 1) return "Waiting";

    // If countdown is active and time has not expired, it's in Countdown phase
    if (
      lastGame.countdownEnd &&
      Date.now() < new Date(lastGame.countdownEnd).getTime()
    ) {
      return "Countdown"; // Return Countdown if it's in progress
    }

    return "None"; // Default status if no game is in progress
  } catch (error) {
    logger.error("Error fetching game status:", error);
    throw new Error("Failed to get game status");
  }
}

async function countPlayers(gameId) {
  try {
    return await prisma.userBingoCard.count({ where: { gameId } });
  } catch (error) {
    logger.error("Error counting players:", error);
    throw new Error("Failed to count players");
  }
}

async function retryOperation(operation, retries = 3, delay = 500) {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    logger.info(
      `Retrying operation, attempts left: ${retries}, error: ${error.message}`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2); // Exponential backoff
  }
}

// Get all stakes
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours
exports.getStakes = async (req, res) => {
  try {
    const cachedStakes = cache.get("stakes");
    if (cachedStakes) {
      return res.json(cachedStakes);
    }

    const stakes = await prisma.stake.findMany();
    const stakeStatuses = stakes.map((stake) => ({
      id: stake.id,
      amount: stake.amount,
    }));

    cache.set("stakes", stakeStatuses);
    res.json(stakeStatuses);
  } catch (error) {
    logger.error("Error fetching stakes:", error);
    res.status(500).json({ error: "Failed to fetch stakes" });
  }
};

exports.checkIfPlayerAlreadyInAGame = async (req, res) => {
  const userId = req.user.id;
  const existingGameForUser = await prisma.bingoGame.findFirst({
    where: {
      hasEnded: false,
      players: {
        some: { userId },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      stake: true,
      players: true,
    },
  });

  if (existingGameForUser) {
    return res.status(200).json({
      inGame: true,
      id: existingGameForUser.id,
      userId: userId,
      stakeId: existingGameForUser.stakeId,
      stake: existingGameForUser.stake,
      possibleWin: existingGameForUser.possibleWin,
      active: existingGameForUser.active,
      countdownStart: existingGameForUser.countdownStart,
      countdownEnd: existingGameForUser.countdownEnd,
      assignedCardIds: existingGameForUser.assignedCardIds,
      drawnNumbers: existingGameForUser.drawnNumbers,
      declaredWinners: existingGameForUser.declaredWinners,
      players: existingGameForUser.players,
      hasEnded: existingGameForUser.hasEnded,
    });
  }

  return res.status(200).json({
    inGame: false,
  });}
  // Add a module-level variable for debouncing join events
let joinDebounceTimeout;
exports.joinGame = (io) => async (req, res) => {
  const { stakeId } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user is already in an active game
    const existingGameForUser = await prisma.bingoGame.findFirst({
      where: {
        hasEnded: false,
        players: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingGameForUser) {
      return res.status(400).json({
        error: `You are already in a game`,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wallet: true, referralBonus: true },
    });
    const stake = await prisma.stake.findUnique({
      where: { id: stakeId },
      select: { amount: true },
    });
    const funds = Number(user.wallet) + Number(user.referralBonus);

    if (funds < Number(stake.amount)) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    let game = await prisma.bingoGame.findFirst({
      where: { stakeId },
      orderBy: { createdAt: "desc" },
      include: { players: true },
    });
    if ((game && game.active) || (game && game.hasEnded)) {
      game = null;
    }

    const unassignedCards = await prisma.bingoCard.findMany({
      where: {
        id: {
          notIn: game ? game.assignedCardIds : [], // Exclude already assigned card IDs
        },
      },
    });

    if (unassignedCards.length === 0) {
      return res
        .status(400)
        .json({ error: "No unassigned Bingo cards available" });
    }

    let updatedGame;
    if (!game) {
      // New game branch: create game with only the human player    	
      const randomIndex = Math.floor(Math.random() * unassignedCards.length);
      const humanCard = unassignedCards[randomIndex];
      updatedGame = await prisma.bingoGame.create({
        data: {
          stakeId,
          possibleWin: Number(stake.amount) * percent, // Only human player's contribution so far
          assignedCardIds: [humanCard.id],
          players: { create: {
            user: { connect: { id: userId } },
            bingoCard: { connect: { id: humanCard.id } },
            markedNumbers: "100",
          } },
        },
      });
      // Schedule bot join 5 seconds later.
      setTimeout(async () => {
        try {
          const botCardCandidates = await prisma.bingoCard.findMany({
            where: { id: { notIn: updatedGame.assignedCardIds } },
          });
          if (botCardCandidates.length === 0) {
            logger.error("No unassigned Bingo cards available for bot late join");
            return;
          }
          const botIndex = Math.floor(Math.random() * botCardCandidates.length);
          const botCard = botCardCandidates[botIndex];
          // Update game: add bot player and set countdown fields
          const updatedGameAfterBot = await prisma.bingoGame.update({
            where: { id: updatedGame.id },
            data: {
              possibleWin: { increment: Number(stake.amount) * percent },
              assignedCardIds: { push: botCard.id },
              players: { create: {
                user: { connect: { id: 1 } }, // Bot: Optimus
                bingoCard: { connect: { id: botCard.id } },
                markedNumbers: "100",
              } },
              countdownStart: new Date(),
              countdownEnd: new Date(Date.now() + 30000) // set a 30s countdown
            },
          });
          // Directly start the countdown with the updated game
          startCountdown(io, stakeId, updatedGameAfterBot.id);
          const fullGameDetails = await prisma.bingoGame.findUnique({
            where: { id: updatedGameAfterBot.id },
            include: { players: { include: { user: true, bingoCard: true } }, stake: true },
          });
          io.to(updatedGameAfterBot.id).emit("gameupdated", fullGameDetails);
        } catch (error) {
          logger.error("Error during bot join after delay", error);
        }
      }, 5000);
    } else {
      // Existing game branch remains unchanged:
      const randomIndex = Math.floor(Math.random() * unassignedCards.length);
      const unassignedCard = unassignedCards[randomIndex];
      updatedGame = await prisma.bingoGame.update({
        where: { id: game.id },
        data: {
          countdownStart:
            game.players.length === 1 ? new Date() : game.countdownStart,
          countdownEnd:
            game.players.length === 1
              ? new Date(new Date().getTime() + 30 * 1000)
              : game.countdownEnd,
          possibleWin: { increment: Number(stake.amount) * percent },
          assignedCardIds: { push: unassignedCard.id }, // Add this card's ID to the assigned list
          players: {
            create: {
              user: {
                connect: { id: userId },
              },
              bingoCard: {
                connect: { id: unassignedCard.id }, // Connect to the existing BingoCard
              },
              markedNumbers: "100",
            },
          },
        },
      });
    }

    // Emit the updated game status after the user joins
    const gameStatus = await getGameStatus(stakeId);
    const lastGame = await prisma.bingoGame.findFirst({
      where: { stakeId },
      orderBy: { createdAt: "desc" },
    });
    const possibleWin = lastGame?.possibleWin;

    io.emit("gameStatusUpdate", { stakeId, gameStatus, possibleWin });

    // If game now has 2 or more players, start countdown
    const fullGameDetails = await prisma.bingoGame.findUnique({
      where: { id: updatedGame?.id },
      include: {
        players: {
          include: {
            user: true, // Include user details
            bingoCard: true, // Include bingo card details
            game: true,
          },
        },
        stake: true, // Include stake details if needed
      },
    });

    // Change: if the game has at least 2 players AND a countdown is not running, (or restart it)
    if (fullGameDetails?.players.length >= 2 && !countdownIntervals[fullGameDetails.id]) {
      // Debounce to ensure a single countdown start trigger
      if (joinDebounceTimeout) {
        clearTimeout(joinDebounceTimeout);
      }
      joinDebounceTimeout = setTimeout(() => {
        startCountdown(io, stakeId, fullGameDetails.id);
        joinDebounceTimeout = null;
      }, 1000);
    }

    // Emit the updated game object
    io.to(fullGameDetails?.id).emit("gameupdated", fullGameDetails);
    res.json({ success: true, game: fullGameDetails });
  } catch (error) {
    logger.error("Error joining game:", error);

    res
      .status(500)
      .json({ error: "Failed to join game", details: error.message });
  }
};

exports.leaveGame = (io) => async (req, res) => {
  const { stakeId } = req.body;
  const userId = req.user.id;

  try {
    // Retry the Prisma operation in case of transient errors
    const stake = await retryOperation(() =>
      prisma.stake.findUnique({
        where: { id: stakeId },
      })
    );

    if (!stake) {
      return res.status(404).json({ error: "Stake not found" });
    }

    // Find the game with retry
    const game = await retryOperation(() =>
      prisma.bingoGame.findFirst({
        where: {
          stakeId,
          players: {
            some: { userId },
          },
          active: false,
          hasEnded: false,
        },
        include: { players: true },
      })
    );

    if (!game) {
      return res.status(400).json({
        error: "You are not in any game or the game is already in progress.",
      });
    }

    // Retry the delete operation in case of transient errors
    await retryOperation(() =>
      prisma.userBingoCard.deleteMany({
        where: {
          userId,
          gameId: game.id,
        },
      })
    );

    logger.info(`User ${userId} left the game.`);

    // Count the remaining players with retry
    const remainingPlayersCount =
      (await retryOperation(() => countPlayers(game.id))) ?? 0;
    logger.info(`Remaining players: ${remainingPlayersCount}`);

    // Handle the rest of the logic based on the remaining players
    if (remainingPlayersCount === 0) {
      // If no players left, retry the transaction for game deletion and related cleanups
      await retryOperation(() =>
        prisma.$transaction([
          prisma.bingoGame.delete({ where: { id: game.id } }),
          prisma.userBingoCard.deleteMany({ where: { gameId: game.id } }), // Clean up related records
        ])
      );

      // Check for previous active games
      const previousGame = await retryOperation(() =>
        prisma.bingoGame.findFirst({
          where: { stakeId, active: true },
          orderBy: { createdAt: "desc" },
        })
      );

      if (previousGame) {
        io.emit("gameStatusUpdate", {
          stakeId,
          gameStatus: "None",
          possibleWin: previousGame.possibleWin,
        });
      } else {
        io.emit("gameStatusUpdate", { stakeId, gameStatus: "None" });
      }
    } else if (remainingPlayersCount === 1) {
      // Handle the countdown clearing logic and retry game updates if needed
      if (countdownIntervals[game.id]) {
        clearInterval(countdownIntervals[game.id]);
        logger.info(`Cleared countdown for game ${game.id}`);
        delete countdownIntervals[game.id];
      }

      await retryOperation(() =>
        prisma.bingoGame.update({
          where: { id: game.id },
          data: {
            countdownEnd: null,
            countdownStart: null,
            possibleWin: { decrement: stake.amount * percent },
          },
        })
      );

      const updatedGame = await retryOperation(() =>
        prisma.bingoGame.findUnique({
          where: { id: game.id },
          include: { players: true },
        })
      );

      io.emit("gameStatusUpdate", {
        stakeId,
        gameStatus: "Waiting",
        possibleWin: updatedGame.possibleWin,
      });
    } else if (remainingPlayersCount > 1) {
      // Handle the case where multiple players remain
      await retryOperation(() =>
        prisma.bingoGame.update({
          where: { id: game.id },
          data: {
            possibleWin: { decrement: stake.amount * percent },
          },
        })
      );

      const latestGame = await retryOperation(() =>
        prisma.bingoGame.findUnique({
          where: { id: game.id },
        })
      );

      io.emit("gameStatusUpdate", {
        stakeId,
        gameStatus: "Countdown",
        possibleWin: latestGame.possibleWin,
      });
    }

    // Emit updated game object
    const updatedGame = await retryOperation(() =>
      prisma.bingoGame.findUnique({
        where: { id: game.id },
        include: {
          players: {
            include: {
              user: true,
              bingoCard: true,
              game: true,
            },
          },
          stake: true,
        },
      })
    );

    io.to(game.id).emit("gameupdated", updatedGame);
    res.json({ success: true, message: "You have left the game" });
  } catch (error) {
    logger.info("Error leaving game:", error);
    res
      .status(500)
      .json({ error: "Failed to leave game. Please try again later." });
  }
};

exports.updateGame = (io) => async (req, res) => {
  const { gameId, cardId } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!gameId || !cardId || !userId) {
      return res
        .status(400)
        .json({ error: "Game ID, card ID, and user ID are required." });
    }

    const game = await prisma.bingoGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    // Check if the player exists in the game
    const existingUserBingoCard = await prisma.userBingoCard.findUnique({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId,
        },
      },
    });
    const prevCardId = existingUserBingoCard.cardId;
    logger.info(prevCardId);
    if (!existingUserBingoCard) {
      return res.status(404).json({ error: "Player not found in the game." });
    }

    // Fetch the BingoCard with the given cardId
    const bingoCard = await prisma.bingoCard.findUnique({
      where: { id: cardId },
    });

    if (!bingoCard) {
      return res.status(404).json({ error: "BingoCard not found." });
    }

    // Update the UserBingoCard's cardId and bingoCard field
    const updatedUserBingoCard = await prisma.userBingoCard.update({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId,
        },
      },
      data: {
        cardId: bingoCard.id,
      },
      include: {
        bingoCard: true, // Include the updated bingoCard in the response
      },
    });
    await prisma.bingoGame.update({
      where: {
        id: gameId,
      },
      data: {
        assignedCardIds: {
          set: game.assignedCardIds
            .filter((id) => id !== prevCardId)
            .concat(bingoCard.id),
        },
      },
    });
    logger.info(
      `Game ${gameId} updated successfully. Player ${userId}'s bingo card updated to card ID ${cardId}.`
    );

    const updatedGame = await prisma.bingoGame.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: true, // Include user details
            bingoCard: true, // Include bingo card details
          },
        },
        stake: true, // Include stake details if needed
      }, // Include players if needed
    });

    // Emit the updated game object
    io.to(gameId).emit("gameupdated", updatedGame);

    res.json({ success: true, userBingoCard: updatedUserBingoCard });
  } catch (error) {
    logger.error("Error updating game:", error);
    res.status(500).json({ error: "Failed to update game or player card ID" });
  }
};

// Mark number on bingo card
exports.markNumber = (io) => async (req, res) => {
  const { num, gameId, cardId } = req.body;
  const userId = req.user.id;

  try {
    // Check if the number was drawn
    if (
      !drawnNumbersMap[gameId] ||
      !Array.from(drawnNumbersMap[gameId]).includes(num)
    ) {
      return res
        .status(400)
        .json({ error: "This number has not been drawn yet." });
    }

    // Fetch player's bingo card
    const card = await retryOperation(() =>
      prisma.userBingoCard.findUnique({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
      })
    );

    if (!card) {
      return res.status(404).json({ error: "Card not found." });
    }

    const markedNumbers = card.markedNumbers
      ? card.markedNumbers.split(",").map(Number)
      : [];

    if (markedNumbers.includes(num)) {
      return res.status(400).json({ error: "Number already marked." });
    }

    markedNumbers.push(num);

    await retryOperation(() =>
      prisma.userBingoCard.update({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
        data: { markedNumbers: markedNumbers.join(",") },
      })
    );

    io.to(userId).emit("markedNumbers", markedNumbers);

    const hasWon = await checkForBingo(cardId, markedNumbers);
    if (hasWon) {
      const game = await prisma.bingoGame.findUnique({
        where: { id: gameId },
        select: { hasEnded: true, declaredWinners: true },
      });

      if (game.hasEnded) {
        return res.status(400).json({ error: "The game has already ended." });
      }

      if (game.declaredWinners.includes(userId)) {
        return res
          .status(400)
          .json({ error: "You have already declared Bingo." });
      }

      // Update declared winners and end the game if it's the first winner
      await prisma.bingoGame.update({
        where: { id: gameId },
        data: {
          declaredWinners: { push: userId },
          hasEnded: game.declaredWinners.length === 0,
        },
      });

      // End the game after declaring bingo
      await endGame(io, gameId);
    }
    res.json({ success: true });
  } catch (error) {
    logger.info("Error marking number:", error);
    handlePrismaError(res, error);
  }
};

// Function to declare Bingo
exports.declareBingo = (io) => async (req, res) => {
  const { gameId } = req.body;
  const userId = req.user.id;

  try {
    const userCard = await prisma.userBingoCard.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (!userCard) {
      return res
        .status(404)
        .json({ error: "You do not have a bingo card for this game." });
    }

    const markedNumbers = userCard.markedNumbers
      ? userCard.markedNumbers.split(",").map(Number)
      : [];

    const hasWon = await checkForBingo(userCard.cardId, markedNumbers); // Assuming you have a winning validation logic here
    if (!hasWon) {
      return res.status(400).json({ error: "No winning pattern detected." });
    }

    const game = await prisma.bingoGame.findUnique({
      where: { id: gameId },
      select: { hasEnded: true, declaredWinners: true },
    });

    if (game.hasEnded) {
      return res.status(400).json({ error: "The game has already ended." });
    }

    if (game.declaredWinners.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already declared Bingo." });
    }

    // Update declared winners and end the game if it's the first winner
    await prisma.bingoGame.update({
      where: { id: gameId },
      data: {
        declaredWinners: { push: userId },
        hasEnded: game.declaredWinners.length === 0,
      },
    });

    // End the game after declaring bingo
    await endGame(io, gameId);

    return res.json({ success: true, message: "Bingo declared!" });
  } catch (error) {
    handlePrismaError(res, error);
  }
};

exports.toggleAuto = async (req, res) => {
  const userId = req.user.id;
  const { gameId, cardId, autoPlay } = req.body;

  try {
    await retryOperation(() =>
      prisma.userBingoCard.update({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
        data: { autoPlay: autoPlay },
      })
    );

    res.json({
      success: true,
      message: `${autoPlay ? "Autoplay turned on" : "Autoplay turned off"}`,
    });
  } catch (error) {
    logger.error("Error toggling autoplay:", error);
    res.status(500).json({ error: "Failed to update autoplay status." });
  }
};

exports.getMarkedListById = async (req, res) => {
  const userId = req.user.id;
  const { gameId, cardId } = req.body;

  try {
    const markedList = await retryOperation(() =>
      prisma.userBingoCard.findUnique({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
      })
    );

    return res.json(markedList?.markedNumbers.split(",").map(Number));
  } catch (error) {
    logger.error("Error fetching marked list:", error);
    res.status(500).json({ error: "Failed to fetch marked list." });
  }
};

exports.getGameById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const game = await retryOperation(() =>
      prisma.bingoGame.findUnique({
        where: { id: id },
        include: {
          players: {
            include: {
              user: true, // Include user details
              bingoCard: true, // Include bingo card details
              game: true,
            },
          },
          stake: true, // Include stake details if needed
        },
      })
    );

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    res.json({ success: true, game });
  } catch (error) {
    logger.error("Error fetching game by ID:", error);
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Game not found." });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch game due to a database error." });
  }
};

// New function to fetch game status
exports.fetchGameStatus = async (req, res) => {
  const { gameId } = req.query; // Get gameId from the request params

  try {
    // Fetch the game status based on the gameId
    const game = await retryOperation(() =>
      prisma.bingoGame.findUnique({
        where: { id: parseInt(gameId) },
      })
    );

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    const status = game.active ? "Playing" : "Not Active";
    res.json({ gameId: game.id, status, possibleWin: game.possibleWin });
  } catch (error) {
    logger.error("Error fetching game status:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch game status due to a database error." });
  }
};

const cardCache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours
exports.listBingoCards = async (req, res) => {
  try {
    const cachedCards = cardCache.get("bingoCards");
    if (cachedCards) {
      return res.json(cachedCards);
    }

    const cards = await retryOperation(() => prisma.bingoCard.findMany());
    cardCache.set("bingoCards", cards);
    res.json(cards);
  } catch (error) {
    logger.error("Error fetching bingo cards:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch bingo cards due to a database error." });
  }
};
