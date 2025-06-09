const prisma = require("../config/prismaClient");
const { subWeeks, subMonths, subYears } = require("date-fns");

const logger = require("../helper/logger");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 10 }); // Cache for 10 minutes
const getLeaderboardData = async (timeFrameFn, req, res) => {
  const cacheKey = `${timeFrameFn.name}_${JSON.stringify(req.query)}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const userId = req.query.userId; // Assuming userId is passed as a query parameter

    // Subtract the appropriate time frame
    const oneTimeFrameAgo = timeFrameFn(new Date(), 1); // Pass the second argument for amount to subtract

    // Ensure the date is valid
    if (
      !(oneTimeFrameAgo instanceof Date) ||
      isNaN(oneTimeFrameAgo.getTime())
    ) {
      return res.status(500).json({ error: "Invalid date calculation" });
    }

    // Destructure pagination parameters from query, with defaults
    const { page = 1, limit = 20 } = req.query;

    // Validate pagination parameters
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Fetch top players based on pagination
    const leaderboard = await prisma.userStatistics.findMany({
      where: {
        updatedAt: { gte: oneTimeFrameAgo },
        gamesPlayed: { gt: 0 },
      },
      orderBy: { amountWon: "desc" },
      select: {
        user: { select: { username: true } },
        gamesWon: true,
        amountWon: true,
      },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
    });

    const leaderboardData = leaderboard.map((stat) => ({
      username: stat.user.username,
      gamesWon: stat.gamesWon,
      amountWon: stat.amountWon,
    }));

    let topThreePlayers = [];
    if (parsedPage === 1) {
      topThreePlayers = leaderboardData.slice(0, 3);
    }

    // If userId is provided, ensure the user is included in the leaderboard
    if (userId) {
      const isUserInLeaderboard = leaderboard.some(
        (stat) => stat.user.username === userId
      );

      if (!isUserInLeaderboard) {
        const userStats = await prisma.userStatistics.findUnique({
          where: {
            userId_updatedAt: {
              userId,
              updatedAt: { gte: oneTimeFrameAgo },
            },
          },
          select: {
            user: { select: { username: true } },
            gamesWon: true,
            amountWon: true,
          },
        });

        if (userStats) {
          leaderboardData.push({
            username: userStats.user.username,
            gamesWon: userStats.gamesWon,
            amountWon: userStats.amountWon,
          });
        }
      }
    }

    const totalGames = await prisma.userStatistics.count({
      where: {
        updatedAt: { gte: oneTimeFrameAgo },
        gamesPlayed: { gt: 0 },
      },
    });

    const totalPages = Math.ceil(totalGames / parsedLimit);

    const responseData = {
      totalPages,
      currentPage: parsedPage,
      totalPlayers: totalGames,
      topThreePlayers,
      restOfThePlayers: leaderboardData.slice(3),
    };

    cache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch leaderboard", details: error.message });
  }
};
exports.getWeeklyLeaderboard = (req, res) =>
  getLeaderboardData(subWeeks, req, res);
exports.getMonthlyLeaderboard = (req, res) =>
  getLeaderboardData(subMonths, req, res);
exports.getYearlyLeaderboard = (req, res) =>
  getLeaderboardData(subYears, req, res);

// Fetch leaderboard based on period type (weekly, monthly, etc.)
exports.getBonusLeaderboard = async (req, res) => {
  const cacheKey = `getBonusLeaderboard_${JSON.stringify(req.params)}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  const { type } = req.params;
  const userId = req.query.userId; // Assuming userId is passed as a query parameter

  try {
    // Fetch all active bonus periods of the given type, also retrieve minDeposit and minGames
    const periods = await prisma.bonusPeriod.findMany({
      where: {
        type,
        status: "active",
        // startDate: { lte: new Date() },
      },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        type: true,
        dateTimeInAMH: true,
        prizeDistribution: true,
        predefinedWinners: true,
        minGames: true,      // NEW field
        minDeposit: true     // NEW field
      },
    });

    if (!periods.length) {
      return res
        .status(404)
        .json({ error: `No active ${type} bonus periods found.` });
    }

    // For each period, fetch the leaderboard and prize details
    const periodsWithLeaderboards = await Promise.all(
      periods.map(async (period) => {
        // Get dynamic thresholds from bonus period (default to 0 if not provided)
        const requiredMinDeposit = period.minDeposit ? Number(period.minDeposit) : 0;
        const requiredMinGames = period.minGames ? period.minGames : 0;

        // Fetch the leaderboard for each period
        const leaderboard = await prisma.bonusPoint.groupBy({
          by: ["userId"],
          where: { bonusPeriodId: period.id },
          _sum: { points: true },
          orderBy: { _sum: { points: "desc" } },
          take: 20,
        });

        // Fetch prize information if prize distribution is PREDEFINED or BOTH
        let prizeData = [];
        if (["PREDEFINED", "BOTH"].includes(period.prizeDistribution)) {
          prizeData = await prisma.prize.findMany({
            where: { bonusPeriodId: period.id },
            orderBy: { rank: "asc" }, // Ensure the prize distribution is in the correct order of ranks
          });
        }

        // Map leaderboard entries to include usernames and rank/amount
        const leaderboardWithUsernames = await Promise.all(
          leaderboard.map(async (entry, index) => {
            const user = await prisma.user.findUnique({
              where: { id: entry.userId },
            });

            // Assign rank and prize amount based on rank
            const rank = index + 1; // Rank starts from 1
            const prizeAmount = prizeData[rank - 1]?.amount || 0; // Get prize amount based on rank

            // Fetch bonus participation for eligibility check instead of userStatistics
            const participation = await prisma.bonusPeriodParticipation.findUnique({
              where: { bonusPeriodId: period.id, userId: entry.userId },
              select: { depositAmount: true, gamesPlayed: true },
            });
            const meetsMinDeposit = participation && participation.depositAmount >= requiredMinDeposit ? "Yes" : "No";
            const meetsMinGame = participation && participation.gamesPlayed >= requiredMinGames ? "Yes" : "No";

            return {
              rank,
              username: user.username,
              phoneNumber: user.phoneNumber,
              totalPoints: entry._sum.points,
              prizeAmount,
              minDeposit: meetsMinDeposit, // New field instead of qualifies
              minGame: meetsMinGame,       // New field instead of qualifies
            };
          })
        );

        // Append the current user if not in top 20, with qualifies check
        if (userId) {
          const userStatsBonus = await prisma.bonusPoint.findUnique({
            where: {
              userId_bonusPeriodId: {
                userId,
                bonusPeriodId: period.id,
              },
            },
            select: { points: true },
          });

          if (userStatsBonus) {
            const userRank = await prisma.bonusPoint.count({
              where: {
                bonusPeriodId: period.id,
                points: { gt: userStatsBonus.points },
              },
            });

            const user = await prisma.user.findUnique({
              where: { id: userId },
            });

            // Fetch current user's eligibility details
            const currentParticipation = await prisma.bonusPeriodParticipation.findUnique({
              where: { bonusPeriodId: period.id, userId },
              select: { depositAmount: true, gamesPlayed: true },
            });
            const meetsMinDeposit = currentParticipation && currentParticipation.depositAmount >= requiredMinDeposit ? "Yes" : "No";
            const meetsMinGame = currentParticipation && currentParticipation.gamesPlayed >= requiredMinGames ? "Yes" : "No";

            leaderboardWithUsernames.push({
              rank: userRank + 1,
              username: user.username,
              phoneNumber: user.phoneNumber,
              totalPoints: userStatsBonus.points,
              prizeAmount: 0, // Default prize amount
              minDeposit: meetsMinDeposit,
              minGame: meetsMinGame,
            });
          }
        }

        // Return the period with its leaderboard
        return {
          period: {
            id: period.id,
            startDate: period.startDate,
            endDate: period.endDate,
            type: period.type,
            dateTimeInAMH: period.dateTimeInAMH,
            prizeDistribution: period.prizeDistribution,
            predefinedWinners: period.predefinedWinners,
          },
          leaderboard: leaderboardWithUsernames,
        };
      })
    );

    const responseData = { periods: periodsWithLeaderboards };
    cache.set(cacheKey, responseData, 60); // Cache for 5 minutes

    res.json(responseData);
  } catch (error) {
    logger.error("Error fetching  bonus leaderboard: ", error);
    return res.status(500).json({ error: "Failed to fetch leaderboards." });
  }
};
