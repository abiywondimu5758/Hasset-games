const express = require("express");
const {
    deleteUser,
    listUsers,
    listBingoGames,
    deleteBingoGame,
    listUserBingoCards,
    listUserStatistics,
    fetchUser,
    updateUser,
    deleteReferredUser,
    listReferredUsers,
    deleteUserStatistics,
    updateBingoGame,
    updateGame,
    updateBingoCard,
    listGames,
    deleteGame,
    listBingoCards,
    fetchBingoGame,
    fetchGame,
    fetchBingoCard,
    fetchUserBingoCard,
    deleteUserBingoCard,
    fetchUserStatistics,
    fetchReferredUser,
    listStakes,           
    fetchStake,
    createStakes,
    deleteStake,
    deleteBingoCard,
    generateBingoCards,
    deleteAllBingoCards,
    regenerateBingoCards,
    createBonusPeriod,
    listBonusPeriods,
    fetchBonusPeriod,
    deleteBonusPeriod,
    updateBonusPeriod,
    activeBonusPeriods,
    drawWinners,
    assignPrizes,
    checkPeriod,
    listTransactions,
    fetchTransaction,
    listPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
} = require("../controllers/roleBasedController");

const {calculateMonthlyAggregates, calculateFees, fetchLast7DaysStats, fetchDashboardData, fetchPlatformFeeStats} = require("../controllers/adminDashboardController");
const {authMiddleware, limiter} = require("../middlewares/authMiddleware");
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// User-related routes
router.get("/users", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listUsers); // List all users
router.delete("/delete-user", authMiddleware, roleMiddleware(['ADMIN']), deleteUser); // Delete a specific user
router.get("/users/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchUser); // Fetch a user by ID
router.put("/users/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), updateUser); // Update a user by ID

// Bingo Game-related routes
router.get("/bingo-games", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listBingoGames); // List all bingo games
router.get("/bingo-games/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchBingoGame); // Fetch a bingo game by ID
router.delete("/bingo-games/delete-bingo-game", authMiddleware, roleMiddleware(['ADMIN']),limiter, deleteBingoGame); // Delete a specific bingo game
router.put("/bingo-games/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), updateBingoGame); // Update bingo game (only `hasEnded` and `active` fields)

// Game-related routes
router.get("/games", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listGames); // List all games
router.get("/games/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchGame); // Fetch a game by ID
router.delete("/delete-game", authMiddleware, roleMiddleware(['ADMIN']), limiter,deleteGame); // Delete a specific game
router.put("/games/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), updateGame); // Update game (title, description, picture)

// Bingo Card-related routes

router.post("/bingo-cards/generate-cards", authMiddleware, roleMiddleware(['ADMIN']),limiter, generateBingoCards);
router.post("/bingo-cards/regenerate-cards", authMiddleware, roleMiddleware(['ADMIN']),limiter, regenerateBingoCards);
router.get("/bingo-cards", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listBingoCards); // List all bingo cards
router.get("/bingo-cards/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchBingoCard); // Fetch a bingo card by ID
router.delete("/bingo-cards/:cardId", authMiddleware, roleMiddleware(['ADMIN']),limiter, deleteBingoCard); // Delete a specific card
router.put("/bingo-cards/:id", authMiddleware, roleMiddleware(['ADMIN']), updateBingoCard); // Update bingo card (only `numbers` field)
router.post("/bingo-cards/delete-bingo-cards", authMiddleware, roleMiddleware(['ADMIN']), limiter,deleteAllBingoCards); 

// User Bingo Card-related routes
router.get("/user-bingo-cards/card", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchUserBingoCard); // Fetch a specific user bingo card
router.get("/user-bingo-cards", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listUserBingoCards); // List user bingo cards
router.delete("/user-bingo-cards/delete-bingo-card", authMiddleware, roleMiddleware(['ADMIN']), limiter, deleteUserBingoCard); // Delete a specific user bingo card


// Statistics-related routes
router.get("/user-statistics/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchUserStatistics); // Fetch specific user statistics
router.get("/user-statistics", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listUserStatistics); // List user statistics
router.delete("/delete-user-statistics", authMiddleware, roleMiddleware(['ADMIN']), limiter, deleteUserStatistics); // Delete user statistics

// Referred User-related routes
router.get("/referred-users", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listReferredUsers); // List referred users
router.get("/referred-users/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchReferredUser); // Fetch a referred user by ID
router.delete("/referred-users/delete-referred-user", authMiddleware, roleMiddleware(['ADMIN']), limiter, deleteReferredUser); // Delete a specific referred user

// Stake-related routes
router.get("/stakes", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listStakes); // List all stakes
router.get("/stakes/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchStake); // Fetch a stake by ID
router.post("/stakes/create", authMiddleware,roleMiddleware(['ADMIN']), createStakes);
router.delete("/stakes/delete-stake/:stakeId", authMiddleware, roleMiddleware(['ADMIN']), deleteStake); // Delete a specific stake


// Bonus related routes
router.get("/bonus-periods", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listBonusPeriods); // List all stakes
router.get("/bonus-periods/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchBonusPeriod); // Fetch a stake by ID
router.post("/bonus-periods/create", authMiddleware,roleMiddleware(['ADMIN']), limiter, createBonusPeriod);
router.delete("/bonus-periods/:bonusPeriodId", authMiddleware, roleMiddleware(['ADMIN']), limiter, deleteBonusPeriod); // Delete a specific 
router.put("/bonus-periods/:id", authMiddleware,roleMiddleware(['ADMIN']),  updateBonusPeriod )


// Jackpot related routes
router.get("/jackpot/periods", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), activeBonusPeriods);
router.post("/jackpot/draw-winners/:bonusPeriodId", authMiddleware, roleMiddleware(['ADMIN']), drawWinners);
router.put("/jackpot/assign-prizes", authMiddleware, roleMiddleware(['ADMIN']),assignPrizes);
router.get("/jackpot/:periodId", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), checkPeriod);

// Transaction related routes
router.get("/transactions", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listTransactions); // List all stakes
router.get("/transactions/:id", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchTransaction); // Fetch a stake by ID

// Withdrawals
router.get("/withdrawals/pending", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), listPendingWithdrawals);
router.post("/withdrawals/approve", authMiddleware, roleMiddleware(['ADMIN']), approveWithdrawal);
router.post("/withdrawals/reject", authMiddleware, roleMiddleware(['ADMIN']), rejectWithdrawal);


router.get("/calculateMonthlyAggregates", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), calculateMonthlyAggregates);
router.get("/calculateFees", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), calculateFees);
router.get("/fetchLast7DaysStats", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchLast7DaysStats);
router.get("/fetchDashboardData", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchDashboardData);

router.get("/fetchPlatformFeeStats", authMiddleware, roleMiddleware(['ADMIN', 'STAFF']), fetchPlatformFeeStats);
module.exports = router;
