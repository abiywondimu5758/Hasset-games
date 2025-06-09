const prisma = require("../config/prismaClient");
const logger = require('../helper/logger');

const emitActiveGames = async (io) => {
  try {
    const activeGames = await prisma.bingoGame.findMany({
      where: { active: true, hasEnded: false },
    });
    io.emit("activeGamesUpdate", { count: activeGames.length });
  } catch (error) {
    logger.error("Error fetching active games:", error);
  }
};

const emitGameMetrics = async (io) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const gamesToday = await prisma.bingoGame.count({ where: { createdAt: { gte: oneDayAgo } } });
    const gamesLast3Days = await prisma.bingoGame.count({ where: { createdAt: { gte: threeDaysAgo } } });
    const gamesLastWeek = await prisma.bingoGame.count({ where: { createdAt: { gte: oneWeekAgo } } });
    const gamesLastMonth = await prisma.bingoGame.count({ where: { createdAt: { gte: oneMonthAgo } } });

    io.emit("gameMetricsUpdate", {
      gamesToday,
      gamesLast3Days,
      gamesLastWeek,
      gamesLastMonth,
    });
  } catch (error) {
    logger.error("Error fetching game metrics:", error);
  }
};

const emitUserMetrics = async (io) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalReferrals = await prisma.user.aggregate({
      _sum: { referredCount: true },
    });

    io.emit("userMetricsUpdate", {
      totalUsers,
      totalReferrals: totalReferrals._sum.referredCount,
    });
  } catch (error) {
    logger.error("Error fetching user metrics:", error);
  }
};

const emitStakeMetrics = async (io) => {
  try {
    const stakesPlayed = await prisma.stake.findMany({
      include: {
        _count: { select: { bingoGames: true } },
      },
    });

    const sortedStakes = stakesPlayed.sort((a, b) => b._count.bingoGames - a._count.bingoGames);

    io.emit("stakeMetricsUpdate", { stakes: sortedStakes });
  } catch (error) {
    logger.error("Error fetching stake metrics:", error);
  }
};

const emitBonusMetrics = async (io) => {
  try {
    const activeBonusPeriods = await prisma.bonusPeriod.findMany({
      where: { status: "active" },
    });

    io.emit("bonusMetricsUpdate", { count: activeBonusPeriods.length });
  } catch (error) {
    logger.error("Error fetching bonus metrics:", error);
  }
};

// Export functions and make sure they receive 'io'
module.exports = {
  emitActiveGames,
  emitGameMetrics,
  emitUserMetrics,
  emitStakeMetrics,
  emitBonusMetrics,
};
