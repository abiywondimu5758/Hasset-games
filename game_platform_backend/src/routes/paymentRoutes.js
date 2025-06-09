const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {authMiddleware} = require('../middlewares/authMiddleware');

// POST /payment/deposit
router.post('/deposit', authMiddleware, paymentController.initiateDeposit);
router.post('/directdeposit', authMiddleware, paymentController.initiateDirectDeposit);


// POST /payment/webhook (Chapa callback)
router.post('/webhook', paymentController.handleChapaWebhook);

// GET /payment/verify?tx_ref=...
router.get('/verify', authMiddleware, paymentController.verifyPayment);

// Post /payment/withdraw
router.post('/withdraw', authMiddleware, paymentController.initiateWithdrawal)

// Route to get the list of banks and filter for telebirr and cbebirr
router.get('/banks', authMiddleware, paymentController.getBanks);

router.post('/approval', paymentController.approveTransfer)

module.exports = router;