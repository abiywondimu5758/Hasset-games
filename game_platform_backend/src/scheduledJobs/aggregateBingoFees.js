const cron = require("node-cron");
const prisma = require("../config/prismaClient");
const logger = require("../helper/logger");

// Function to aggregate bingo fees for a specific date
const aggregateBingoFees = async (date) => {
  try {
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

    // Aggregate bingo fees from BingoFee model
    const aggregatedFees = await prisma.bingoFee.aggregate({
      where: { createdAt: { gte: startDate, lt: endDate } },
      _sum: { amount: true },
    });

    const totalFeeAmount = aggregatedFees._sum.amount || 0;

    // Fetch existing aggregate data from DailyBingoFeeAggregate model
    const existingAggregate = await prisma.dailyBingoFeeAggregate.findUnique({
      where: { date: startDate },
    });

    // If existing data is present, compare and reconcile
    if (existingAggregate) {
      const feeDiff = totalFeeAmount - Number(existingAggregate.amount);

      // Update the aggregated data only if there is a difference
      if (feeDiff !== 0) {
        await prisma.dailyBingoFeeAggregate.update({
          where: { date: startDate },
          data: { amount: { increment: feeDiff } },
        });
        console.log(`Reconciled bingo fees for date: ${date}`);
      } else {
        console.log(`No discrepancies found for bingo fees on date: ${date}`);
      }
    } else {
      // Create the aggregated data if it doesn't exist
      await prisma.dailyBingoFeeAggregate.create({
        data: { date: startDate, amount: totalFeeAmount },
      });
      console.log(`Bingo fees aggregated for date: ${date}`);
    }
  } catch (error) {
    logger.error(`Error aggregating bingo fees for date: ${date}`, error);
  }
};

// Schedule the job to run every day at midnight
cron.schedule(
  "0 0 * * *",
  async () => {
    const today = new Date();
    await aggregateBingoFees(today);
    console.log("Bingo fee aggregation job completed.");
  },
  {
    scheduled: true,
    timezone: "Etc/GMT-3", // Set the timezone to EAT
  }
);

console.log(
  "Bingo fee aggregation job scheduled to run daily at midnight EAT."
);
