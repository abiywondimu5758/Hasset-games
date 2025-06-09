const express = require("express");
const { createGame, getGames } = require("../controllers/gameController");
const { authMiddleware, limiter } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply rate limiter to creation routes
router.post('/create-game', authMiddleware, limiter, createGame); // Limit game creation
router.get('/games', authMiddleware, getGames); 

module.exports = router;
