const express = require("express");
const router = express.Router();
const {
  getStakes,
  joinGame,
  listBingoCards,
  leaveGame,
  updateGame,
  declareBingo,
  fetchGameStatus,
  markNumber,
  getMarkedListById,
  checkIfPlayerAlreadyInAGame,
  toggleAuto,
  getGameById,
} = require("../controllers/bingoController");


const {authMiddleware} = require("../middlewares/authMiddleware");

const setupBingoRoutes = (io) => {
  // Route to get the stakes and game statuses
  router.get("/stakes", authMiddleware, getStakes);


  // Route to join a game
  router.post("/join", authMiddleware, joinGame(io));
  router.get("/bingo-cards", authMiddleware, listBingoCards);
  router.put("/leave-game", authMiddleware, leaveGame(io));
  router.put("/update-game", authMiddleware, updateGame(io));
  router.post("/declare-bingo", authMiddleware, declareBingo(io));
  router.get("/game-status", authMiddleware, fetchGameStatus);
  router.post("/mark-number", authMiddleware, markNumber(io));
  router.post("/marked-list", authMiddleware, getMarkedListById);
  router.get("/Check-player", authMiddleware, checkIfPlayerAlreadyInAGame);
  router.post("/toggle-game-mode", authMiddleware, toggleAuto);
  router.get("/games/:id", authMiddleware, getGameById);
  return router;
};

module.exports = setupBingoRoutes;
