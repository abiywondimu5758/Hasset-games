const express = require("express");
const {
  getProfile,
  changePassword,
  changeUsername,
  listUserBingoGameHistory,
  listUserReferralHistory,
  getTransactionHistory,
} = require("../controllers/userController");
const {authMiddleware} = require("../middlewares/authMiddleware");

const router = express.Router();

// Protect the route with authMiddleware
router.get("/profile", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePassword);
router.post("/change-username", authMiddleware, changeUsername);
router.get("/user-game-history", authMiddleware, listUserBingoGameHistory);
router.get("/user-referral-history", authMiddleware, listUserReferralHistory);

router.get("/user-transaction-history", authMiddleware, getTransactionHistory);

module.exports = router;
