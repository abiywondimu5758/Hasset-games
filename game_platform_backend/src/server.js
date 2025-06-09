require('dotenv').config({ path: '.env.production' })
const http = require("http");
const app = require("./app");
const prisma = require("./config/prismaClient");
const { Server } = require("socket.io");
const {
  emitActiveGames,
  emitGameMetrics,
  emitUserMetrics,
  emitBonusMetrics,
  emitStakeMetrics,
} = require("./controllers/socketData");

const logger = require('./helper/logger');

// Create an HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activeUsers = 0;

io.on("connection", async (socket) => {
  // console.log("User connected: ", socket.id);

  activeUsers++;
  

  // Function to get game statuses and emit them to the client
  const emitGameStatuses = async () => {
    try {
      const stakes = await prisma.stake.findMany();
      for (const stake of stakes) {
        const lastGame = await prisma.bingoGame.findFirst({
          where: { stakeId: stake.id },
          orderBy: { createdAt: "desc" },
        });

        let gameStatus = "None";
        if (lastGame) {
          const playersCount = await prisma.userBingoCard.count({
            where: { gameId: lastGame.id },
          });
          if (lastGame.active) {
            gameStatus = "Playing";
          } else if (
            playersCount > 1 &&
            lastGame.countdownEnd &&
            Date.now() < new Date(lastGame.countdownEnd).getTime()
          ) {
            gameStatus = "Countdown";
            const timeRemaining =
              new Date(lastGame.countdownEnd).getTime() - Date.now();
            const timeInSeconds = Math.ceil(timeRemaining / 1000);
            socket.emit("gameCountdownUpdate", {
              stakeId: stake.id,
              timeInSeconds,
            });
          } else if (lastGame.hasEnded) {
            gameStatus = "None";
          } else {
            gameStatus = playersCount === 1 ? "Waiting" : "None";
          }
        }

        let possibleWin;
        if (lastGame?.possibleWin != 0 && !lastGame?.hasEnded) {
          possibleWin = lastGame?.possibleWin;
        }

        socket.emit("gameStatusUpdate", {
          stakeId: stake.id,
          gameStatus,
          possibleWin,
        });
      }
    } catch (error) {
      logger.error("Error emitting game statuses: ", error);
    }
  };

  await emitGameStatuses();

  socket.on("requestGameStatus", async () => {
    // console.log(`Client ${socket.id} requested game statuses`);
    await emitGameStatuses();
  });

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    // console.log(`Client ${socket.id} joined game room: ${gameId}`);
  });

  socket.on("acceptUserInfo", (userId) => {
    socket.join(userId);
    // console.log(`Client ${socket.id} accepted user info: ${userId}`);
  });

  socket.on("realTimeAdminUpdates", async () => {
    await emitActiveGames(io);
    await emitGameMetrics(io);
    await emitUserMetrics(io);
    await emitBonusMetrics(io);
    await emitStakeMetrics(io);
    io.emit("activeUsersUpdate", { count: activeUsers });
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected: ", socket.id);

    activeUsers--;
    io.emit("activeUsersUpdate", activeUsers);
    socket.removeAllListeners(); // Clean up listeners to avoid memory leaks
  });
});

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    // console.log("Database connection has been established successfully.");
  } catch (err) {
    logger.error("Unable to connect to the database:", err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  // console.log("SIGINT signal received: closing server and disconnecting from database");
  await prisma.$disconnect();
  process.exit(0);
});

// Export the io instance for use in other files
module.exports = { server, io };

// Start periodic emissions
setInterval(() => emitActiveGames(io), 10000);
setInterval(() => emitGameMetrics(io), 10000);
setInterval(() => emitUserMetrics(io), 10000);
setInterval(() => emitBonusMetrics(io), 10000);
setInterval(() => emitStakeMetrics(io), 10000);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
const PORT = process.env.PORT || 5000;
testDbConnection().then(() => {
  const bingoRoutes = require("./routes/bingoRoutes")(io); // Ensure io is passed
  app.use("/bingo", bingoRoutes);
  
  server.listen(PORT, '0.0.0.0',() => {
    logger.info(`Server is running on port ${PORT}`);
  });
});
