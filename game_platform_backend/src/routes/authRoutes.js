const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  checkUsernameAvailability,
  sendOTP,
  forgotPassword,
  changeForgottenPassword,
  resendOTP,
  staffRegister,
  staffLogin,
  refreshToken,
  logout
} = require("../controllers/authController");

const router = express.Router();

// Apply rate limiting to sensitive routes to prevent abuse
// const authLimiter = rateLimit({
//   windowMs: 2 * 60 * 1000, // 15 minutes
//   max: 30, // Limit to 3 requests per 1 minute
//   message: { error: 'Too many attempts, please retry in 2 minutes.' },
// });

// Public routes
router.post("/register",  register); // Apply limiter to registration
router.post("/login", login);       // Apply limiter to login
router.get("/check-username", checkUsernameAvailability);
router.post("/send-otp", sendOTP);
router.post("/forgot-password", forgotPassword); // Apply limiter to password reset
router.post("/change-forgotten-password", changeForgottenPassword); // Apply limiter
router.post("/resend-otp", resendOTP); // Apply limiter to OTP resend
router.post("/staff-register", staffRegister); // Apply limiter
router.post("/staff-login", staffLogin); // Apply limiter
router.post("/refresh-token", refreshToken); // Apply limiter
router.post("/logout", logout); // Apply limiter

module.exports = router;
