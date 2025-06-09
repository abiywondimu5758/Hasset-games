const fetch = require("node-fetch-commonjs");
const prisma = require("../config/prismaClient");
const crypto = require("crypto");
const logger = require('../helper/logger');

// Define the withdrawal approval limit
const WITHDRAWAL_APPROVAL_LIMIT = 1000; // Set your desired limit

// Initialize a payment (create a transaction)
exports.initiateDeposit = async (req, res) => {
  
  try {
    
    const { phoneNumber, username, amount } = req.body;
    if (!phoneNumber || !username || !amount) {
      return res.status(400).json({ message: "amount is required." });
    }

    if(amount < 10){
      return res.status(400).json({ message: "Minimum deposit is 10 birr" });
    }
    
    // Prepare data for Chapa
    const tx_ref = `ref-${Date.now()}`; // Or generate any unique reference
    const payload = {
      amount: String(amount),
      currency: "ETB",
      email: "", // Required by Chapa, can be user email
      first_name: username, // The user’s name from your data
      last_name: "",
      phone_number: phoneNumber, // Must be in 09xxxxxxxx or 07xxxxxxxx format
      tx_ref,
      callback_url: "https://api.bingo.fortunebets.net/payment/webhook", // Where Chapa notifies you
      return_url: "", // Where user is redirected after payment
      customization: {
        title: "AEAB Deposit",
        description: "User deposit transaction",
      },
    };

    // Set up headers for Chapa
    const myHeaders = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, // Your Chapa secret key
      "Content-Type": "application/json",
    };
    const chapaRes = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
      }
    );
    const data = await chapaRes.json();

    // If successful, return checkout_url to redirect user
    if (data.status === "success" && data.data) {
      // You might store this tx_ref in your DB now if you wish

      return res.json({
        success: true,
        checkoutUrl: data.data.checkout_url,
        tx_ref,
      });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to initialize payment" });
    }
  } catch (error) {
    logger.info("Error in intitate deposit", error);
    return res.status(500).json({ message: "Error initializing deposit." });
  }
};

// Function to initiate a direct deposit
exports.initiateDirectDeposit = async (req, res) => {
  try {
    const { type, amount, phoneNumber, username } = req.body;
    return res.status(400).json({ message: "Deposit is unavailable currently, please contact support" });
    // Validate required fields
    if (!type || !amount || !phoneNumber || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if(amount < 10){
      return res.status(400).json({ message: "Minimum deposit is 10 birr" });
    }
    // Construct the Chapa API endpoint based on the payment type
    const url = `https://api.chapa.co/v1/charges?type=${type}`;

    const tx_ref = `ref-${Date.now()}`;
    // Prepare the payload for the Chapa API request
    const payload = {
      amount: String(amount),
      currency: "ETB",
      mobile: phoneNumber,
      first_name: username,
      tx_ref: tx_ref,
    };

    // Set up headers for Chapa
    const headers = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
    // Make the API request to Chapa
    const chapaRes = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    const data = await chapaRes.json();
    // Handle the response from Chapa
    if (data.status === "success") {
      // Handle successful initialization
      return res.status(200).json({
        success: true,
        message: "Direct deposit initiated successfully.",
        data: data.data, // Include any relevant data from Chapa's response
      });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to initialize payment" });
    }
  } catch (error) {
    logger.info("Error in initiate direct deposit", error);
    return res
      .status(500)
      .json({ message: "Error initiating direct deposit." });
  }
};


// Initialize a withdrawal (create a transaction)
exports.initiateWithdrawal = async (req, res) => {
  try {
    const { phoneNumber, username, amount, account_number, bank_code } =
      req.body;
    if (!phoneNumber || !username || !amount || !account_number || !bank_code) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Lookup user in DB by username
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check minimum withdrawal amount (wallet must be at least 50 birr)
    if (Number(user.wallet) < 50) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal is set at 50 birr" });
    }
    // Check if user has sufficient balance
    if (Number(user.wallet) < Number(amount)) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Ensure the user is not in an active bingo game initiated in the last 30 minutes
    const activeBingoGame = await prisma.bingoGame.findFirst({
      where: {
        hasEnded: false,
        createdAt: {
          gte: thirtyMinutesAgo,
        },
        players: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (activeBingoGame) {
      return res.status(400).json({
        message: "You cannot withdraw while in an active bingo game.",
      });
    }

    if (Number(amount) > WITHDRAWAL_APPROVAL_LIMIT) {
      // Create a WithdrawalRequest for amounts above the approval limit
      const withdrawalRequest = await prisma.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: Number(amount),
          accountNumber: account_number,
          bankCode: bank_code,
          status: "PENDING",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Sent for approval to admin.",
        withdrawalRequestId: withdrawalRequest.id,
      });
    }

    // Proceed with the normal withdrawal process
    // Prepare data for Chapa
    const tx_ref = `ref-${Date.now()}`;
    const payload = {
      account_number,
      amount: String(amount),
      currency: "ETB",
      reference: tx_ref,
      bank_code,
    };

    // Set up headers for Chapa
    const myHeaders = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
    const chapaRes = await fetch("https://api.chapa.co/v1/transfers", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
    });
    const data = await chapaRes.json();

    if (data.status === "success") {
      // Perform the wallet deduction atomically in a transaction to prevent concurrent withdrawals
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Atomically decrement wallet if sufficient funds exist
        const result = await tx.user.updateMany({
          where: {
            id: user.id,
            wallet: { gte: Number(amount) },
          },
          data: {
            wallet: { decrement: Number(amount) },
          },
        });
        if (result.count === 0) {
          return res.status(400).json({
            message: "Insufficient balance.",
          });
        }

        // Save the withdrawal transaction record
        const transactionData = {
          event: "withdrawal",
          username: user.username,
          mobile: phoneNumber,
          currency: "ETB",
          amount: String(amount),
          charge: "0", // Assuming no charge for withdrawal
          status: data.status,
          failure_reason: data.message,
          mode: "live",
          reference: data.data,
          created_at: new Date(),
          updated_at: new Date(),
          type: "withdrawal",
          tx_ref,
          payment_method: "bank_transfer",
          customization: {
            title: "AEAB Withdrawal",
            description: "User withdrawal transaction",
          },
          meta: {},
          userWalletUpdated: true,
          userId: user.id,
        };

        await tx.transaction.create({
          data: transactionData,
        });

        // Track the withdrawal in WalletTransaction model
        await tx.walletTransaction.create({
          data: {
            type: "WITHDRAWAL",
            amount: Number(amount),
          },
        });

        // Update the global wallet aggregate by decreasing the balance
        await tx.walletAggregate.upsert({
          where: { id: 1 },
          update: { currentBalance: { decrement: Number(amount) } },
          create: { id: 1, currentBalance: -Number(amount) },
        });

        // Update WalletTransactionAggregate directly
        const today = new Date();
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        await tx.walletTransactionAggregate.upsert({
          where: { date: startDate },
          update: { withdrawal: { increment: Number(amount) } },
          create: { date: startDate, deposit: 0, withdrawal: Number(amount) },
        });

        // Return the updated user after successful deduction
        return tx.user.findUnique({ where: { id: user.id } });
      });

      return res.json({
        success: true,
        message: data.message,
        reference: tx_ref,
        updatedWallet: updatedUser.wallet,
      });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to initiate withdrawal" });
    }
  } catch (error) {
    logger.info("Error in withdrawal", error);
    return res
      .status(500)
      .json({ message: "Error initiating withdrawal: " + error.message });
  }
};

// Handle the webhook callback from Chapa
exports.handleChapaWebhook = async (req, res) => {
  try {
    // 1) Verify that the payload is from Chapa
    const signature = req.headers["x-chapa-signature"];
    const secret = process.env.CHAPA_WEBHOOK_SECRET_HASH;

    if (!secret) {
      return res.status(500).json({
        message: "Server misconfiguration: Webhook secret is missing.",
      });
    }

    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (!signature || signature !== hash) {
      return res.status(403).json({ message: "Invalid webhook signature." });
    }

    // 2) Check if the payment is successful
    const { status, amount, tx_ref, first_name, mobile } = req.body;

    if (status !== "success") {
      return res
        .status(200)
        .json({ message: `Payment not successful for tx_ref ${tx_ref}` });
    }

    // 3) Lookup user in DB by phoneNumber or other logic

    let formattedMobile = mobile;
    if (mobile && mobile.startsWith("251")) {
      formattedMobile = "0" + mobile.substring(3);
    }
    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedMobile },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found for webhook transaction." });
    }
    const transactionData = {
      event: req.body.event,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      username: req.body.first_name === null? req.body.mobile:req.body.first_name,
      mobile: req.body.mobile,
      currency: req.body.currency,
      amount: req.body.amount,
      charge: req.body.charge,
      status: req.body.status,
      failure_reason: req.body.failure_reason,
      mode: req.body.mode,
      reference: req.body.reference,
      created_at: req.body.created_at,
      updated_at: req.body.updated_at,
      type: "Deposit",
      tx_ref: req.body.tx_ref,
      payment_method: req.body.payment_method,
      customization: {
        title: "AEAB Deposit",
        description: "User deposit transaction",
      },
      meta: req.body.meta,
      userWalletUpdated: false,
      userId: user.id,
    };
    await prisma.transaction.create({
      data: transactionData,
    });
    // 4) Update user’s wallet and totalDeposit
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        wallet: String(Number(user.wallet) + Number(amount)),
        totalDeposit: { increment: Number(amount) }
      },
    });
    // Track the deposit in WalletTransaction model
    await prisma.walletTransaction.create({
      data: {
        type: "DEPOSIT",
        amount: Number(amount),
      },
    });
    
    // Update the global wallet aggregate by increasing the balance
    // Ensure WalletAggregate exists
    await prisma.walletAggregate.upsert({
      where: { id: 1 },
      update: { currentBalance: { increment: Number(amount) } },
      create: { id: 1, currentBalance: Number(amount) },
    });
    // Update WalletTransactionAggregate directly
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    await prisma.walletTransactionAggregate.upsert({
      where: { date: startDate },
      update: { deposit: { increment: Number(amount) } },
      create: { date: startDate, deposit: Number(amount), withdrawal: 0 },
    });
    
    // Award referral bonus if applicable: 
    // If the user was referred and the total deposits now reach 25 birr, award 5 birr to the referrer.
    if (updatedUser.referredBy) {
      // Lookup the referrer user using the referral code stored in referredBy.
      const referringUser = await prisma.user.findUnique({
        where: { referralCode: updatedUser.referredBy }
      });
      if (referringUser && Number(updatedUser.totalDeposit) >= 25) {
        // Check if a referral record exists for this deposit that hasn't been awarded.
        const referralRecord = await prisma.referredUser.findFirst({
          where: {
            referrerId: referringUser.id,
            referredUsername: updatedUser.username,
            bonusAwarded: false,
          },
        });
        if (referralRecord) {
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: referringUser.id },
              data: { wallet: { increment: 5 } },
            });
            await tx.referredUser.update({
              where: { id: referralRecord.id },
              data: { bonusAwarded: true },
            });
          });
        }
      }
    }
    
    // Update transaction to note wallet was updated
    await prisma.transaction.update({
      where: { reference: req.body.reference },
      data: { userWalletUpdated: true },
    });
    
    // Update depositAmount in BonusPeriodParticipation for all active bonus periods
    const activePeriods = await prisma.bonusPeriod.findMany({
      where: { status: "active" }
    });
    
    for (const period of activePeriods) {
      const existingParticipation = await prisma.bonusPeriodParticipation.findUnique({
        where: { bonusPeriodId_userId: { bonusPeriodId: period.id, userId: user.id } }
      });
      
      if (existingParticipation) {
        await prisma.bonusPeriodParticipation.update({
          where: { bonusPeriodId_userId: { bonusPeriodId: period.id, userId: user.id } },
          data: { depositAmount: { increment: Number(amount) } }
        });
      } else {
        await prisma.bonusPeriodParticipation.create({
          data: {
            bonusPeriodId: period.id,
            userId: user.id,
            gamesPlayed: 0,
            depositAmount: Number(amount),
            stakeIds: [] // No stakes tracked for a direct deposit
          }
        });
      }
    }
    
    // 5) Acknowledge the webhook
    return res
      .status(200)
      .json({ success: true, updatedWallet: updatedUser.wallet });
  } catch (error) {
    logger.info("Error in Webhook", error);
    return res.status(500).json({ message: "Webhook processing failed." });
  }
};

// (Optional) Verify transaction endpoint if you’d like to confirm status
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.query;
    if (!tx_ref) {
      return res.status(400).json({ message: "tx_ref is required." });
    }

    const myHeaders = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    };
    const verifyRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: myHeaders,
      }
    );
    const data = await verifyRes.json();

    if (data.status === "success") {
      return res.status(200).json({ data: data.data });
    } else {
      return res.status(400).json({ data: data.data });
    }
  } catch (error) {
    logger.info("Error in verify payment", error);
    return res.status(500).json({ message: "Verification error." });
  }
};

// Get the list of banks and filter for telebirr and cbebirr
exports.getBanks = async (req, res) => {
  try {
    const myHeaders = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    };
    const banksRes = await fetch("https://api.chapa.co/v1/banks", {
      method: "GET",
      headers: myHeaders,
    });
    const data = await banksRes.json();

    if (data.message === "Banks retrieved") {
      const filteredBanks = data.data.filter(
        (bank) =>
          bank.slug === "telebirr" ||
          bank.slug === "mpesa" ||
          bank.slug === "cbebirr"
      );
      return res.status(200).json({ success: true, banks: filteredBanks });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to retrieve banks." });
    }
  } catch (error) {
    logger.info("Error in getBanks", error);
    return res.status(500).json({ message: "Error retrieving banks." });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const { amount, reference, bank, account_name, account_number } = req.body;
    const chapaSignature = req.headers["chapa-signature"];
    const bodyData = JSON.stringify({
      amount,
      reference,
      bank,
      account_name,
      account_number,
    });

    const hash = crypto
      .createHmac("sha256", process.env.CHAPA_APPROVAL_SECRET)
      .update(bodyData)
      .digest("hex");

    if (chapaSignature === hash) {
      // console.log("Transfer Approved:", req.body);
      res.status(200).send("Transfer approved");
    } else {
      // console.log("Transfer Rejected:", req.body);
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    logger.info("Error in approve transfer", error);
    res.status(500).json({ message: "Error approving transfer." });
  }
};

exports.ensureWalletAggregateRecord = async () => {
  // Attempt to upsert the record with id: 1
  await prisma.walletAggregate.upsert({
    where: { id: 1 },
    update: {
      // ...existing code...
    },
    create: {
      id: 1,
      // ...existing code...
    },
  });
};
