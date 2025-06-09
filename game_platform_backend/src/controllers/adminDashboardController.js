const logger = require("../helper/logger");
const prisma = require("../config/prismaClient");

// Helper function to fetch aggregated data from the WalletTransactionAggregate model
const getAggregates = async (startDate, endDate, retries = 3) => {
  try {
    const aggregates = await prisma.walletTransactionAggregate.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        deposit: true,
        withdrawal: true,
      },
    });
    let totalDeposit = 0;
    let totalWithdrawal = 0;

    aggregates.forEach((aggregate) => {
      totalDeposit += Number(aggregate.deposit);
      totalWithdrawal += Number(aggregate.withdrawal);
    });


    return {
      deposit: totalDeposit,
      withdrawal: totalWithdrawal,
    };
  } catch (error) {
    logger.error("Error in getAggregates:", error);
    if (retries > 0 && error.message === "Prisma client is not initialized.") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getAggregates(startDate, endDate, retries - 1);
    }
    throw error;
  }
};

// Helper function to fetch aggregated data for a specific date
const getDailyAggregate = async (date) => {
  const startDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const endDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );

  const aggregate = await prisma.walletTransactionAggregate.findUnique({
    where: { date: startDate },
    select: {
      deposit: true,
      withdrawal: true,
      date: true,
      createdAt: true,
      updatedAt: true,
      id: true,
    },
  });
  return aggregate || { deposit: 0, withdrawal: 0 };
};

// Helper function to fetch platform fees from DailyBingoFeeAggregate
const getPlatformFees = async (startDate, endDate) => {
  const data = await prisma.dailyBingoFeeAggregate.aggregate({
    where: { createdAt: { gte: startDate, lt: endDate } },
    _sum: { amount: true },
  });

  return data._sum.amount || 0;
};

// Function to calculate monthly aggregates for tax purposes
exports.calculateMonthlyAggregates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Use provided dates or default to current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const start = startDate
      ? new Date(startDate)
      : new Date(currentYear, currentMonth, 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(currentYear, currentMonth + 1, 0);

    // Get the aggregates for the specified month
    const monthlyAggregates = await getAggregates(start, end);

    res.status(200).json({
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      deposit: monthlyAggregates.deposit,
      withdrawal: monthlyAggregates.withdrawal,
    });
  } catch (error) {
    logger.error("Error fetching platform fee stats:", error);
    res
      .status(500)
      .json({ message: "Failed to calculate monthly aggregates." });
  }
};

// Function to calculate fees within a date range
exports.calculateFees = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Use provided dates or default to current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const start = startDate
      ? new Date(startDate)
      : new Date(currentYear, currentMonth, 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(currentYear, currentMonth + 1, 0);

    const totalFees = await getPlatformFees(start, end);

    res.status(200).json({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      totalFees: totalFees,
    });
  } catch (error) {
    logger.error("Error fetching platform fee stats:", error);
    res.status(500).json({ message: "Failed to calculate fees." });
  }
};

exports.fetchLast7DaysStats = async (req, res) => {
  try {
    logger.info("Fetching last 7 days stats");
    const now = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const aggregate = await getDailyAggregate(date);
      logger.info("Fetching last 7 days stats", aggregate);
      last7Days.push({
        date: date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        deposit: Number(aggregate.deposit),
        withdrawal: Number(aggregate.withdrawal),
      });
    }
    logger.info("Fetching last 7 days stats", last7Days);
    res.status(200).json({ last7Days });
  } catch (error) {
    logger.error("Error fetching platform fee stats:", error);
    res.status(500).json({ message: "Failed to fetch last 7 days stats." });
  }
};

exports.fetchDashboardData = async (req, res) => {
  try {
    const now = new Date();

    // Daily: start of today to tomorrow
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // Weekly: last 7 days (inclusive of today)
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );

    // Monthly: last 30 days
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 29
    );

    // Quarterly: last 90 days
    const startOfQuarter = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 89
    );

    // Six-Month: last 180 days
    const startOfSixMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 179
    );

    // Yearly: last 365 days
    const startOfYear = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 364
    );

    // Get aggregates for each period
    const daily = await getAggregates(startOfDay, endOfDay);
    const weekly = await getAggregates(startOfWeek, endOfDay);
    const monthly = await getAggregates(startOfMonth, endOfDay);
    const quarterly = await getAggregates(startOfQuarter, endOfDay);
    const sixMonth = await getAggregates(startOfSixMonth, endOfDay);
    const yearly = await getAggregates(startOfYear, endOfDay);

    res.status(200).json({
      daily,
      weekly,
      monthly,
      quarterly,
      sixMonth,
      yearly,
    });
  } catch (error) {
    logger.error("Error fetching platform fee stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

// Function to fetch platform fee stats
exports.fetchPlatformFeeStats = async (req, res) => {
  try {
    const now = new Date();

    // Date ranges
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 29
    );
    const startOfQuarter = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 89
    );
    const startOfSixMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 179
    );
    const startOfYear = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 364
    );

    // Fetch platform fees for each period
    const daily = await getPlatformFees(startOfDay, endOfDay);
    const weekly = await getPlatformFees(startOfWeek, endOfDay);
    const monthly = await getPlatformFees(startOfMonth, endOfDay);
    const quarterly = await getPlatformFees(startOfQuarter, endOfDay);
    const sixMonth = await getPlatformFees(startOfSixMonth, endOfDay);
    const yearly = await getPlatformFees(startOfYear, endOfDay);

    res.status(200).json({
      daily,
      weekly,
      monthly,
      quarterly,
      sixMonth,
      yearly,
    });
  } catch (error) {
    logger.error("Error fetching platform fee stats:", error);
    res.status(500).json({ message: "Failed to fetch platform fee stats." });
  }
};
