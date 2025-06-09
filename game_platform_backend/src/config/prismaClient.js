const { PrismaClient } = require("@prisma/client");
let prisma;

if (!prisma) {
  prisma = new PrismaClient({
    // log: ["query", "info", "warn", "error"],

    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

module.exports = prisma;
