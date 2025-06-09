const express = require("express");
const { getWeeklyLeaderboard, getMonthlyLeaderboard, getYearlyLeaderboard, getBonusLeaderboard } = require("../controllers/statController");
const {authMiddleware} = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/weekly-leaderboard', authMiddleware, getWeeklyLeaderboard);
router.get('/monthly-leaderboard', authMiddleware, getMonthlyLeaderboard);
router.get('/yearly-leaderboard', authMiddleware, getYearlyLeaderboard);
router.get('/bonus-leaderboard', authMiddleware, getBonusLeaderboard);

module.exports = router;