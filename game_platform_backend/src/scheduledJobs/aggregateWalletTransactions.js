const cron = require("node-cron");
const prisma = require("../config/prismaClient");

// Function to aggregate wallet transactions for a specific date
const aggregateWalletTransactions = async (date) => {
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

    const data = await prisma.walletTransaction.groupBy({
      by: ["type"],
      where: { createdAt: { gte: startDate, lt: endDate } },
      _sum: { amount: true },
    });

    const deposits = data.find((d) => d.type === "DEPOSIT")?._sum.amount || 0;
    const withdrawals =
      data.find((d) => d.type === "WITHDRAWAL")?._sum.amount || 0;

    // Fetch existing aggregate data
    const existingAggregate =
      await prisma.walletTransactionAggregate.findUnique({
        where: { date: startDate },
      });

    // If existing data is present, compare and reconcile
    if (existingAggregate) {
      const depositDiff = deposits - Number(existingAggregate.deposit);
      const withdrawalDiff = withdrawals - Number(existingAggregate.withdrawal);

      // Update the aggregated data only if there is a difference
      if (depositDiff !== 0 || withdrawalDiff !== 0) {
        await prisma.walletTransactionAggregate.update({
          where: { date: startDate },
          data: {
            deposit: { increment: depositDiff },
            withdrawal: { increment: withdrawalDiff },
          },
        });
        console.log(`Reconciled wallet transactions for date: ${date}`);
      } else {
        console.log(`No discrepancies found for date: ${date}`);
      }
    } else {
      // Create the aggregated data if it doesn't exist
      await prisma.walletTransactionAggregate.create({
        data: { date: startDate, deposit: deposits, withdrawal: withdrawals },
      });
      console.log(`Wallet transactions aggregated for date: ${date}`);
    }
  } catch (error) {
    console.error(
      `Error aggregating wallet transactions for date: ${date}`,
      error
    );
  }
};

// Schedule the job to run every day at midnight
cron.schedule(
  "0 0 * * *",
  async () => {
    const today = new Date();
    await aggregateWalletTransactions(today);
    console.log("Wallet transaction aggregation job completed.");
  },
  {
    scheduled: true,
    timezone: "Etc/GMT-3", // Set the timezone to EAT
  }
);

console.log(
  "Wallet transaction aggregation job scheduled to run daily at midnight EAT."
);
