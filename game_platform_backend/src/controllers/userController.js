const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");
const logger = require('../helper/logger');
const NodeCache = require("node-cache");


const profileCache = new NodeCache({ stdTTL: 1 }); // 180 seconds = 3 minutes
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Access the user ID from the token

    // Check if profile is in cache
    const cachedProfile = profileCache.get(userId);
    if (cachedProfile) {
      return res.json({ user: cachedProfile, cached: true });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        wallet: true,
        referralCode: true,
        referralBonus: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Store profile in cache
    profileCache.set(userId, user);

    res.json({ user, cached: false });
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};



exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id; // assuming req.user is populated by an auth middleware

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New passwords do not match" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("Password Change Error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// Change Username
exports.changeUsername = async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id; // assuming req.user is populated by an auth middleware

  if (!username) {
    return res.status(400).json({ error: "Username can't be empty" });
  }

  try {
    formattedUsername = username.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the new username is unique
    const existingUser = await prisma.user.findUnique({ where: { username:formattedUsername } });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { username: formattedUsername },
    });

    res.status(200).json({ message: "Username changed successfully" });
  } catch (error) {
    console.log(error)
    logger.error("Username Change Error:", error);
    res.status(500).json({ error: "Failed to change username" });
  }
};

// List User Bingo Game History
const CACHE_TTL = 60; // 5 minutes
exports.listUserBingoGameHistory = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const cacheKey = `bingoHistory_${userId}_${page}_${limit}`;

  // Check if cached
  const cachedData = profileCache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, cached: true });
  }

  try {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage < 1 || parsedLimit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (parsedPage - 1) * parsedLimit;

    const userGames = await prisma.userBingoCard.findMany({
      where: { userId: userId },
      skip: offset,
      take: parsedLimit,
      include: {
        game: {
          select: {
            stake: { select: { amount: true } },
            possibleWin: true,
            declaredWinners: true,
            assignedCardIds: true,
            countdownEnd: true,
            players: { select: { userId: true, cardId: true } },
            hasEnded: true,
          },
        },
      },
    });

    const totalGames = await prisma.userBingoCard.count({ where: { userId: userId } });

    const gameHistory = userGames.map(userGame => {
      const isWinner = userGame.game.declaredWinners.includes(userId);
      const winnerCards = userGame.game.declaredWinners.map(winnerId => {
        const winnerCard = userGame.game.players.find(player => player.userId === winnerId);
        return { winnerId, cardId: winnerCard ? winnerCard.cardId : null };
      });

      return {
        gameId: userGame.gameId,
        stakeAmount: userGame.game.stake.amount,
        possibleWin: userGame.game.possibleWin,
        userCardId: userGame.cardId,
        winnerCards,
        result: isWinner ? "won" : "lost",
        date: userGame.game.countdownEnd,
      };
    });

    const totalPages = Math.ceil(totalGames / parsedLimit);
    const response = {
      totalPages,
      currentPage: parsedPage,
      totalGames,
      gameHistory,
    };

    // Cache the response
    profileCache.set(cacheKey, response, CACHE_TTL);

    res.status(200).json({ ...response, cached: false });
  } catch (error) {
    logger.error("List User Game History Error:", error);
    res.status(500).json({ error: "Failed to retrieve user game history" });
  }
};

// List User Referral History
exports.listUserReferralHistory = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query; // Destructure page and limit from query params
  const cacheKey = `referralHistory_${userId}_${page}_${limit}`;

  // Check if cached
  const cachedData = profileCache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, cached: true });
  }

  try {
    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage < 1 || parsedLimit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Calculate the offset for pagination
    const offset = (parsedPage - 1) * parsedLimit;
    
    const referrals = await prisma.referredUser.findMany({
      where: { referrerId: userId },
      skip: offset,
      take: parsedLimit,
    });

    const totalReferrals = await prisma.referredUser.count({
      where: { referrerId: userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralBonus: true, referralCode: true },
    });

    const totalPages = Math.ceil(totalReferrals / parsedLimit);
    const totalAmountEarnedFromReferrals = totalReferrals * 5; // Assuming each referral gives $5
    const currentAmountLeft = Number(user.referralBonus);

    const response = {
      totalPages,
      currentPage: parsedPage,
      totalReferrals,
      totalAmountEarnedFromReferrals,
      currentAmountLeft,
      referralCode: user.referralCode,
      referrals,
    };

    // Cache the response for 120 seconds (2 minutes)
    profileCache.set(cacheKey, response, 120);
    res.status(200).json({ ...response, cached: false });
  } catch (error) {
    logger.error("List User Referral History Error:", error);
    res.status(500).json({ error: "Failed to retrieve user referral history" });
  }
};

exports.getTransactionHistory = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Validate the query parameters
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage < 1 || parsedLimit < 1) {
    return res.status(400).json({ error: "Invalid pagination parameters" });
  }

  const userId = req.user.id;
  const cacheKey = `transactionHistory_${userId}_page${parsedPage}_limit${parsedLimit}`;

  // Check if cached data exists
  const cachedData = profileCache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, cached: true });
  }

  const skip = (parsedPage - 1) * parsedLimit;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        amount: true,
        updated_at: true,
        status: true,
        type: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      skip: skip,
      take: parsedLimit,
    });

    const totalTransactions = await prisma.transaction.count({
      where: { userId },
    });

    const totalPages = Math.ceil(totalTransactions / parsedLimit);

    const response = {
      totalPages,
      currentPage: parsedPage,
      totalTransactions,
      transactions,
    };

    // Cache the response for 180 seconds (3 minutes)
    profileCache.set(cacheKey, response, 180);

    res.status(200).json({ ...response, cached: false });
  } catch (error) {
    logger.error("Error fetching transaction history:", error);
    res.status(500).json({ error: "Failed to retrieve transaction history" });
  }
};
