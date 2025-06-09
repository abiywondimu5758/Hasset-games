const prisma = require("../config/prismaClient");

const logger = require("../helper/logger");
const NodeCache = require("node-cache");

const generateBingoNumbers = () => {
  const getRandomNumbersInRange = (min, max, count) => {
    const numbers = new Set();
    while (numbers.size < count) {
      numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return [...numbers];
  };

  // Generate sets of numbers based on the specified ranges
  const firstSet = getRandomNumbersInRange(1, 15, 5);
  const secondSet = getRandomNumbersInRange(16, 30, 5);
  const thirdSet = getRandomNumbersInRange(31, 45, 4);
  const fourthSet = getRandomNumbersInRange(46, 60, 5);
  const fifthSet = getRandomNumbersInRange(61, 75, 5); // Only 4 numbers, since 100 will be added at position 13

  // Combine all sets
  let numbers = [
    ...firstSet,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...fifthSet,
  ];

  // Insert 100 at the 13th position (index 12)
  numbers.splice(12, 0, 100);

  // Join the numbers with commas
  return numbers.join(",");
};

// USER
const cache = new NodeCache({ stdTTL: 10 }); // Cache expires after 5 minutes
exports.listUsers = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    // If search is a number (and not an empty string), use it for id search.
    const idSearch = !isNaN(Number(search)) && search.trim() !== "" ? Number(search) : null;
    const verified = req.query.verified !== undefined ? req.query.verified === "true" : null;
    const role = req.query.role || null;
    const sortBy = req.query.sortBy || "registrationDate";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build the OR conditions.
    const orConditions = [];
    if (idSearch !== null) {
      orConditions.push({ id: idSearch });
    }
    orConditions.push({ username: { contains: search, mode: "insensitive" } });
    // Only search phoneNumber if the search starts with "09" or "07"
    if (search.startsWith("09") || search.startsWith("07")) {
      orConditions.push({ phoneNumber: { contains: search, mode: "insensitive" } });
    }

    const where = {
      ...(verified !== null && { verified }),
      ...(role && { role }),
      ...(startDate && endDate ? { registrationDate: { gte: startDate, lte: endDate } } : {}),
      OR: orConditions,
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        wallet: true,
        referralCode: true,
        referralBonus: true,
        referredBy: true,
        referredCount: true,
        registrationDate: true,
        verified: true,
        otp: true,
        role: true,
        userBingoCards: true,
        _count: true,
      },
    });

    const totalUsers = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalUsers / limit);

    const response = {
      users,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },
    };

    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    logger.error("List Users Error:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};
exports.fetchUser = async (req, res) => {
  const id = Number(req.params.id);
  // Get pagination parameters for userBingoCards
  const cardPage = parseInt(req.query.cardPage) || 1;
  const cardLimit = parseInt(req.query.cardLimit) || 10;
  const cardOffset = (cardPage - 1) * cardLimit;

  try {
    // Fetch user details excluding userBingoCards
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        email: true,
        wallet: true,
        referralCode: true,
        referralBonus: true,
        referredBy: true,
        referredCount: true,
        registrationDate: true,
        verified: true,
        statistics: true,
        totalDeposit: true,
        otp: true,
        role: true,
        gamesPlayed: true,
        gamesWon: true,
        gamesLost: true,
        _count: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch paginated userBingoCards for the user in descending order by id
    const userBingoCards = await prisma.userBingoCard.findMany({
      where: { userId: id },
      orderBy: { gameId: 'desc' },
      skip: cardOffset,
      take: cardLimit,
    });

    const totalUserBingoCards = await prisma.userBingoCard.count({
      where: { userId: id },
    });

    res.status(200).json({
      user,
      userBingoCards,
      pageInfo: {
        currentPage: cardPage,
        totalPages: Math.ceil(totalUserBingoCards / cardLimit),
        totalUserBingoCards,
        cardLimit,
      },
    });
  } catch (error) {
    logger.error("Fetch User Error:", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};
exports.updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const { username, phoneNumber, email, wallet, role, referralBonus } = req.body;

  const userDetails = {
    username: username || undefined,
    phoneNumber: phoneNumber || undefined,
    email: email || undefined,
    wallet: wallet ? parseFloat(wallet) : undefined,
    role: role || "USER",
    referralBonus: referralBonus || undefined
  };

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the new username is already in use by another user
    if (userDetails.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: userDetails.username,
          NOT: { id }
        },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username already in use" });
      }
    }
    if (userDetails.phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: userDetails.phoneNumber,
          NOT: { id }
        },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Phone number already in use" });
      }
    }

    let updatedUser;
    if (wallet !== undefined && Number(wallet) !== Number(user.wallet)) {
      // Admin is updating the wallet
      const amount = Number(wallet) - Number(user.wallet); // Calculate the difference
      const eventType = amount > 0 ? "Admin_Deposit" : "Admin_Withdrawal";
      const tx_ref = `Admin-${Date.now()}`;

      const transactionData = {
        event: eventType,
        first_name: null,
        last_name: null,
        email: user.email,
        username: user.username,
        mobile: user.phoneNumber,
        currency: "ETB",
        amount: String(Math.abs(amount)),
        charge: "0",
        status: "success",
        failure_reason: null,
        mode: "Admin",
        reference: tx_ref,
        created_at: new Date(),
        updated_at: new Date(),
        type: amount > 0 ? "Deposit" : "Withdrawal",
        tx_ref: tx_ref,
        payment_method: "Admin_Update",
        customization: {
          title: "Admin Wallet Update",
          description: `Wallet updated by Admin for user ${phoneNumber}- ${eventType}`,
        },
        meta: {},
        userWalletUpdated: true,
        userId: user.id,
      };

      await prisma.transaction.create({
        data: transactionData,
      });

      updatedUser = await prisma.user.update({
        where: { id },
        data: userDetails,
      });

      // Track the deposit in WalletTransaction model
      await prisma.walletTransaction.create({
        data: {
          type: amount > 0 ? "DEPOSIT" : "WITHDRAWAL",
          amount: Math.abs(amount),
        },
      });

      // // Update the global wallet aggregate by increasing the balance
      // await prisma.walletAggregate.upsert({
      //   where: { id: 1 },
      //   update: { currentBalance: { increment: Number(amount) } },
      //   create: { id: 1, currentBalance: Number(amount) },
      // });

      // // Update WalletTransactionAggregate directly
      // const today = new Date();
      // const startDate = new Date(
      //   today.getFullYear(),
      //   today.getMonth(),
      //   today.getDate()
      // );

      // await prisma.walletTransactionAggregate.upsert({
      //   where: { date: startDate },
      //   update: {
      //     deposit: { increment: amount > 0 ? Math.abs(amount) : 0 },
      //     withdrawal: { increment: amount < 0 ? Math.abs(amount) : 0 },
      //   },
      //   create: {
      //     date: startDate,
      //     deposit: amount > 0 ? Math.abs(amount) : 0,
      //     withdrawal: amount < 0 ? Math.abs(amount) : 0,
      //   },
      // });
    } else {
      updatedUser = await prisma.user.update({
        where: { id },
        data: userDetails,
      });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    logger.error("Update User Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Failed to update user" });
    }
  }
};
exports.deleteUser = async (req, res) => {
  const { userId } = req.query;
  const id = Number(userId);

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.bonusPoint.deleteMany({ where: { userId: id } });

      await prisma.userStatistics.deleteMany({ where: { userId: id } });

      await prisma.userBingoCard.deleteMany({ where: { userId: id } });

      await prisma.user.delete({ where: { id } });
    });

    res.status(200).json({
      message:
        "User and associated statistics, Bingo cards, and Bonus points deleted successfully",
    });
  } catch (error) {
    logger.error("Delete User Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
};

// REFERRED USERS
const referralCache = new NodeCache({ stdTTL: 180 }); // Cache expires after 5 minutes
exports.listReferredUsers = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = referralCache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Filtering options
    const search = req.query.search?.trim() || "";
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    // Determine if search is numeric
    const numericSearch =
      !isNaN(Number(search)) && search !== "" ? Number(search) : null;

    // Build OR conditions for search (by id, referrer id, username, etc.)
    const orConditions = [];
    if (numericSearch !== null) {
      orConditions.push({ id: numericSearch });
      orConditions.push({ referrer: { id: numericSearch } });
    }
    if (search) {
      orConditions.push({
        referredUsername: { contains: search, mode: "insensitive" },
      });
      orConditions.push({
        referredPhone: { contains: search, mode: "insensitive" },
      });
      orConditions.push({
        referrer: { username: { contains: search, mode: "insensitive" } },
      });
      orConditions.push({
        referrer: { phoneNumber: { contains: search, mode: "insensitive" } },
      });
    }

    // Build the filter options
    const where = {
      ...(startDate && endDate
        ? { registrationDate: { gte: startDate, lte: endDate } }
        : {}),
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    };

    // Sorting options
    const validSortFields = [
      "registrationDate",
      "referredUsername",
      "referredPhone",
    ];
    const sortBy =
      req.query.sortBy && validSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : "registrationDate";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
    const orderBy = { [sortBy]: sortOrder };

    // Fetch referred users
    const referredUsers = await prisma.referredUser.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        orderBy,
        { referredUsername: sortOrder },
        { referredPhone: sortOrder },
      ],
      select: {
        id: true,
        referredUsername: true,
        referredPhone: true,
        registrationDate: true,
        bonusAwarded: true,
        referrer: { select: { id: true, username: true, phoneNumber: true } },
      },
    });

    // Total number of referred users
    const totalReferredUsers = await prisma.referredUser.count({ where });
    const totalPages = Math.ceil(totalReferredUsers / limit);

    const response = {
      referredUsers,
      pageInfo: { currentPage: page, totalPages, totalReferredUsers, limit },
    };

    referralCache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    logger.error("List Referred Users Error:", error);
    res.status(500).json({ error: "Failed to retrieve referred users" });
  }
};
exports.fetchReferredUser = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const referredUser = await prisma.referredUser.findUnique({
      where: { id },
      select: {
        id: true,
        referredUsername: true,
        referredPhone: true,
        registrationDate: true,
        bonusAwarded: true,
        referrer: { select: { username: true, phoneNumber: true } },
      },
    });

    if (!referredUser) {
      return res.status(404).json({ error: "Referred user not found" });
    }

    res.status(200).json(referredUser);
  } catch (error) {
    logger.error("Fetch Referred User Error:", error);
    res.status(500).json({ error: "Failed to retrieve referred user" });
  }
};
exports.deleteReferredUser = async (req, res) => {
  const { referredUserId } = req.query;
  const id = Number(referredUserId);

  try {
    // Start transaction to ensure memory safety and related deletions
    const transactionResult = await prisma.$transaction(async (prisma) => {
      // Find the referred user to ensure existence
      const referredUser = await prisma.referredUser.findUnique({
        where: { id },
      });

      if (!referredUser) {
        throw new Prisma.PrismaClientKnownRequestError(
          "P2025",
          "referredUser",
          "delete"
        );
      }

      // Delete related entities in a transaction
      await prisma.userBingoCard.deleteMany({ where: { userId: id } });
      await prisma.userStatistics.deleteMany({ where: { userId: id } });

      // Delete the referred user
      await prisma.referredUser.delete({ where: { id } });

      return { message: "Referred user and related data deleted successfully" };
    });

    res.status(200).json(transactionResult);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Referred user not found" });
    }
    logger.error("Delete ReferredUser Error:", error);
    res.status(500).json({ error: "Failed to delete referred user" });
  }
};

// GAMES
exports.listGames = async (req, res) => {
  try {
    const cacheKey = "listGames";
    const cachedGames = cache.get(cacheKey);
    if (cachedGames) {
      return res.status(200).json(cachedGames);
    }

    const games = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        picture: true,
        stakes: {
          select: {
            amount: true,
          },
        },
        usersPlayed: {
          select: {
            username: true,
          },
        },
        usersWon: {
          select: {
            username: true,
          },
        },
        usersLost: {
          select: {
            username: true,
          },
        },
      },
    });

    cache.set(cacheKey, games);

    res.status(200).json(games);
  } catch (error) {
    logger.error("List Games Error:", error);

    // Granular error handling for Prisma/network/database issues
    if (error.code === "P2002") {
      res.status(400).json({ error: "Unique constraint failed" });
    } else if (error.networkError) {
      res.status(503).json({ error: "Network Error. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to retrieve games" });
    }
  }
};
exports.fetchGame = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        picture: true,
        stakes: {
          select: {
            id: true,
            amount: true,
          },
        },
        usersPlayed: {
          select: {
            id: true,
            username: true,
          },
        },
        usersWon: {
          select: {
            id: true,
            username: true,
          },
        },
        usersLost: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.status(200).json(game);
  } catch (error) {
    logger.error("Fetch Game Error:", error);

    // Granular error handling for specific errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Game not found" });
    } else if (error.networkError) {
      res.status(503).json({ error: "Network Error. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to retrieve game" });
    }
  }
};
exports.updateGame = async (req, res) => {
  const id = Number(req.params.id); // Get Game ID from the URL parameters
  const { title, description, picture } = req.body; // Destructure editable fields from request body

  // Create an object with the fields to update
  const gameDetails = {
    title: title || undefined, // Use undefined to skip updating if not provided
    description: description || undefined,
    picture: picture || undefined,
  };

  try {
    // Update the Game in the database
    const updatedGame = await prisma.game.update({
      where: { id }, // Specify the game to update by ID
      data: gameDetails, // Provide the fields to update
    });

    // Respond with the updated game data
    res.status(200).json({ game: updatedGame });
  } catch (error) {
    logger.error("Update Game Error:", error);

    // Granular error handling for specific errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Game not found" });
    } else if (error.code === "P2002") {
      res.status(400).json({ error: "Unique constraint violation" });
    } else if (error.networkError) {
      res.status(503).json({ error: "Network Error. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to update game" });
    }
  }
};
exports.deleteGame = async (req, res) => {
  const { gameId } = req.query; // Get gameId from query parameters
  const id = Number(gameId);

  try {
    // Find the Game to ensure it exists
    const game = await prisma.game.findUnique({ where: { id: id } });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Use a transaction to ensure memory and consistency
    await prisma.$transaction([
      prisma.userBingoCard.deleteMany({ where: { gameId: id } }), // Delete related entities in batch
      prisma.game.delete({ where: { id: id } }), // Now delete the Game
    ]);

    res.status(200).json({
      message: "Game and related entities deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Game Error:", error);

    // Handle specific errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Game not found" });
    } else if (error.networkError) {
      res.status(503).json({ error: "Network Error. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to delete game" });
    }
  }
};

// STAKES
exports.listStakes = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 15; // Default to 15 items per page
    const offset = (page - 1) * limit; // Calculate the offset

    // Get search and sort parameters from the query
    const search = Number(req.query.search?.trim()) || ""; // Search by amount
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc"; // Default sorting order (asc)

    // Build the filter for searching by amount if search is provided
    const where = {
      ...(search && { amount: { equals: search } }),
    };

    // Fetch stakes with search, sort, and pagination
    const stakes = await prisma.stake.findMany({
      where,
      orderBy: { amount: sortOrder }, // Sort by amount
      skip: offset,
      take: limit,
      select: {
        id: true,
        amount: true,
      },
    });

    // Get total count of stakes for pagination
    const totalStakes = await prisma.stake.count({ where });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalStakes / limit);

    const response = {
      stakes,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalStakes,
        limit,
      },
    };

    // Store the response in cache
    cache.set(cacheKey, response);

    // Return the stakes and pagination information
    res.status(200).json(response);
  } catch (error) {
    logger.error("List Stakes Error:", error);

    res.status(500).json({ error: "Failed to retrieve stakes" });
  }
};
exports.fetchStake = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const stake = await prisma.stake.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        games: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        bingoGames: {
          select: {
            id: true,
            createdAt: true,
            active: true,
            possibleWin: true,
          },
        },
      },
    });

    if (!stake) {
      return res.status(404).json({ error: "Stake not found" });
    }

    res.status(200).json(stake);
  } catch (error) {
    logger.error("Fetch Stake Error:", error);

    res.status(500).json({ error: "Failed to retrieve stake" });
  }
};
exports.createStakes = async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newStake = await prisma.stake.create({
      data: { amount },
    });

    res.status(201).json({ message: "Stake created", stake: newStake });
  } catch (error) {
    logger.error("Stake creation error:", error);

    // Prisma error handling for unique constraint violation
    if (error.code === "P2002") {
      res.status(400).json({
        error: "Stake with this amount already exists",
      });
    } else {
      res.status(500).json({ error: "Stake creation failed" });
    }
  }
};
exports.deleteStake = async (req, res) => {
  const { stakeId } = req.params;
  const id = Number(stakeId);

  try {
    // Find the Stake to ensure it exists
    const stake = await prisma.stake.findUnique({ where: { id: id } });

    if (!stake) {
      return res.status(404).json({ error: "Stake not found" });
    }

    // Batch delete related entities in a transaction to avoid multiple DB calls
    await prisma.$transaction([
      prisma.bingoGame.deleteMany({ where: { stakeId: id } }),
      prisma.stake.delete({ where: { id: id } }),
    ]);

    res.status(200).json({
      message: "Stake and associated Bingo games deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Stake Error:", error);

    // Prisma error handling
    if (error.code === "P2025") {
      res.status(404).json({ error: "Stake not found" });
    } else {
      res.status(500).json({ error: "Failed to delete stake" });
    }
  }
};

// BINGOGAMES
exports.listBingoGames = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Build search, filter, and sort criteria
    const search = req.query.search?.trim() || "";
    const idSearch = !isNaN(Number(search)) && search !== "" ? Number(search) : null;
    const hasEnded =
      req.query.hasEnded === "true"
        ? true
        : req.query.hasEnded === "false"
        ? false
        : null;
    const active =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
        ? false
        : null;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    // Handle date filters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build the filter and search options
    const where = {
      ...(hasEnded !== null && { hasEnded }), // Filter by hasEnded if provided
      ...(active !== null && { active }), // Filter by active if provided
      ...(startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {}), // Filter by date range
      ...(search && {
        OR: [
          ...(idSearch ? [{ id: idSearch }] : []),
          { players: { some: { userId: parseInt(search) } } }
        ]
      }),
    };

    // Fetch bingo games with filtering, sorting, and pagination
    const bingoGames = await prisma.bingoGame.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        stake: true,
        active: true,
        countdownStart: true,
        countdownEnd: true,
        possibleWin: true,
        hasEnded: true,
        players: true,
        declaredWinners: true,
        assignedCardIds: true,
        drawnNumbers: true,
      },
    });

    // Get the total number of bingo games for pagination
    const totalBingoGames = await prisma.bingoGame.count({ where });

    const totalPages = Math.ceil(totalBingoGames / limit);

    const response = {
      bingoGames,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBingoGames,
        limit,
      },
    };

    // Store the response in cache
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    logger.error("List Bingo Games Error:", error);
    if (error.code === "ECONNREFUSED") {
      res
        .status(503)
        .json({ error: "Service Unavailable: Database connection failed" });
    } else {
      res.status(500).json({
        error: "Internal Server Error: Failed to retrieve bingo games",
      });
    }
  }
};
exports.fetchBingoGame = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const bingoGame = await prisma.bingoGame.findUnique({
      where: { id },
      select: {
        id: true,
        stakeId: true,
        stake: true,
        createdAt: true,
        active: true,
        hasEnded: true,
        countdownStart: true,
        countdownEnd: true,
        possibleWin: true,
        declaredWinners: true,
        assignedCardIds: true,
        drawnNumbers: true,
        players: true,
        _count: true,
      },
    });

    if (!bingoGame) {
      return res.status(404).json({ error: "Bingo Game not found" });
    }
    res.status(200).json(bingoGame);
  } catch (error) {
    logger.error("Fetch Bingo Game Error:", error);
    res.status(500).json({ error: "Failed to retrieve Bingo Game" });
  }
};
exports.updateBingoGame = async (req, res) => {
  const id = Number(req.params.id);
  const { hasEnded, active } = req.body;

  const gameDetails = {
    hasEnded: hasEnded !== undefined ? hasEnded : undefined,
    active: active !== undefined ? active : undefined,
  };

  try {
    const updatedGame = await prisma.bingoGame.update({
      where: { id },
      data: gameDetails,
    });

    res.status(200).json({ bingoGame: updatedGame });
  } catch (error) {
    logger.error("Update Bingo Game Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Bingo game not found" });
    }
    res.status(500).json({ error: "Failed to update Bingo game" });
  }
};
exports.deleteBingoGame = async (req, res) => {
  const { gameId } = req.query;
  const id = Number(gameId);

  try {
    // Use transaction for optimized deletion
    await prisma.$transaction(async (tx) => {
      // Check if game exists
      const bingoGame = await tx.bingoGame.findUnique({ where: { id } });

      if (!bingoGame) {
        throw new Error("P2025"); // Manually throwing error for game not found
      }

      // Delete related UserBingoCard entries and the game itself in a batch
      await tx.userBingoCard.deleteMany({ where: { gameId: id } });
      await tx.bingoGame.delete({ where: { id } });
    });

    res.status(200).json({
      message: "Bingo game and associated cards deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Bingo Game Error:", error);

    // Handle specific Prisma errors or general errors
    if (error.message === "P2025") {
      return res.status(404).json({ error: "Bingo game not found" });
    } else if (error.code === "P2003") {
      res
        .status(400)
        .json({ error: "Bad Request: Foreign key constraint failed" });
    } else if (error.code === "ECONNREFUSED") {
      res
        .status(503)
        .json({ error: "Service Unavailable: Database connection failed" });
    } else {
      res.status(500).json({ error: "Failed to delete Bingo game" });
    }
  }
};

// USERBINGOCARDS
exports.listUserBingoCards = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Filtering options
    const search = req.query.search?.trim() || "";
    const autoPlay =
      req.query.autoPlay !== undefined ? req.query.autoPlay === "true" : null;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    // Determine if search is a number, used for id search
    const idSearch =
      !isNaN(Number(search)) && search !== "" ? Number(search) : null;

    // Build the filter and search options
    const where = {
      ...(autoPlay !== null && { autoPlay }), // Filter by autoPlay if provided
      ...(startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {}), // Filter by date range
      ...(search && {
        OR: [
          idSearch !== null && { userId: idSearch },
          idSearch !== null && { gameId: idSearch },
          idSearch !== null && { cardId: idSearch },
          {
            user: {
              OR: [
                { username: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ].filter(Boolean),
      }),
    };

    // Define the order by fields based on the sortBy parameter
    const sortBy = req.query.sortBy || "createdAt"; // Default sorting field
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc"; // Default sorting order
    const orderBy = {
      [sortBy]: sortOrder,
    };

    // Fetch user bingo cards with filtering, sorting, and pagination
    const userBingoCards = await prisma.userBingoCard.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        orderBy,
        { gameId: sortOrder }, // Additional sorting based on gameId
        { userId: sortOrder }, // Additional sorting based on userId
        { cardId: sortOrder }, // Additional sorting based on cardId
      ],
      select: {
        userId: true,
        gameId: true,
        user: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
          },
        },
        game: {
          select: {
            id: true,
            stakeId: true,
            active: true,
            hasEnded: true,
            createdAt: true,
            possibleWin: true,
            declaredWinners: true,
            drawnNumbers: true,
          },
        },
        cardId: true,
        createdAt: true,
        markedNumbers: true,
        autoPlay: true,
      },
    });

    // Get the total number of user bingo cards for pagination
    const totalUserBingoCards = await prisma.userBingoCard.count({ where });
    const totalPages = Math.ceil(totalUserBingoCards / limit);

    const response = {
      userBingoCards,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalUserBingoCards,
        limit,
      },
    };

    // Store the response in cache
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    logger.error("List User Bingo Cards Error:", error);
    res.status(500).json({ error: "Failed to retrieve user bingo cards" });
  }
};
exports.fetchUserBingoCard = async (req, res) => {
  const { userId, gameId } = req.query;
  try {
    const userBingoCard = await prisma.userBingoCard.findUnique({
      where: {
        userId_gameId: { userId: Number(userId), gameId: Number(gameId) },
      },
      select: {
        userId: true,
        gameId: true,
        user: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
          },
        },
        game: {
          select: {
            id: true,
            stakeId: true,
            active: true,
            hasEnded: true,
            createdAt: true,
            possibleWin: true,
            declaredWinners: true,
            drawnNumbers: true,
          },
        },
        cardId: true,
        createdAt: true,
        markedNumbers: true,
        autoPlay: true,
      },
    });
    if (!userBingoCard) {
      return res.status(404).json({ error: "User Bingo Card not found" });
    }
    res.status(200).json(userBingoCard);
  } catch (error) {
    logger.error("Fetch User Bingo Card Error:", error);

    res.status(500).json({ error: "Failed to retrieve User Bingo Card" });
  }
};
exports.deleteUserBingoCard = async (req, res) => {
  const { userId: userIdd, gameId: gameIdd, cardId: cardIdd } = req.query;
  const cardId = Number(cardIdd);
  const userId = Number(userIdd);
  const gameId = Number(gameIdd);

  try {
    const transaction = await prisma.$transaction(async (prisma) => {
      // Find the BingoCard to ensure it exists
      const bingoCard = await prisma.userBingoCard.findUnique({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
      });

      if (!bingoCard) {
        throw new Prisma.PrismaClientKnownRequestError(
          "User Bingo card not found",
          "P2025"
        );
      }

      // Now delete the BingoCard along with any related entities
      await prisma.userBingoCard.delete({
        where: { userId_gameId_cardId: { userId, gameId, cardId } },
      });

      // Optionally batch delete other related records if needed (e.g. statistics)
      await prisma.userStatistics.deleteMany({
        where: { userId },
      });

      return {
        message: "User Bingo card and related records deleted successfully",
      };
    });

    res.status(200).json(transaction);
  } catch (error) {
    logger.error("Delete BingoCard Error:", error);

    res.status(500).json({ error: "Failed to delete Bingo card" });
  }
};

// BINGOCARDS
exports.listBingoCards = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Get search and sort parameters
    const searchVal = req.query.search?.trim();
    const searchId = !isNaN(Number(searchVal)) && searchVal !== "" ? Number(searchVal) : null;
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const where = {
      ...(searchId !== null && { id: searchId }),
    };

    // Fetch bingo cards with pagination and filters
    const bingoCards = await prisma.bingoCard.findMany({
      where,
      orderBy: { id: sortOrder },
      skip: offset,
      take: limit,
      select: {
        id: true,
        numbers: true,
      },
    });

    const totalBingoCards = await prisma.bingoCard.count({ where });
    const totalPages = Math.ceil(totalBingoCards / limit);

    const response = {
      bingoCards,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBingoCards,
        limit,
      },
    };

    // Store the response in cache
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    logger.error("List Bingo Cards Error:", error);
    res.status(500).json({
      error: "Failed to retrieve bingo cards",
      details: error.message,
    });
  }
};
exports.fetchBingoCard = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const bingoCard = await prisma.bingoCard.findUnique({
      where: { id },
      select: {
        id: true,
        numbers: true,
        userBingoCard: {
          select: {
            user: { select: { id: true, username: true } },
            game: { select: { id: true, active: true } },
          },
        },
      },
    });

    if (!bingoCard) {
      return res.status(404).json({ error: "Bingo Card not found" });
    }
    res.status(200).json(bingoCard);
  } catch (error) {
    logger.error("Fetch Bingo Card Error:", error);
    res.status(500).json({
      error: "Failed to retrieve Bingo Card",
      details: error.message,
    });
  }
};
exports.updateBingoCard = async (req, res) => {
  const id = Number(req.params.id);
  const { numbers } = req.body;

  const cardDetails = { numbers: numbers || undefined };

  try {
    const updatedCard = await prisma.bingoCard.update({
      where: { id },
      data: cardDetails,
    });

    res.status(200).json({ bingoCard: updatedCard });
  } catch (error) {
    logger.error("Update Bingo Card Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Bingo card not found" });
    }
    res.status(500).json({
      error: "Failed to update Bingo card",
      details: error.message,
    });
  }
};
exports.deleteBingoCard = async (req, res) => {
  const { cardId } = req.params;
  const id = Number(cardId);
  try {
    const bingoCard = await prisma.bingoCard.findUnique({ where: { id } });

    if (!bingoCard) {
      return res.status(404).json({ error: "Bingo Card not found" });
    }

    // Delete the Bingo Card
    await prisma.bingoCard.delete({ where: { id } });

    res.status(200).json({ message: "Bingo Card deleted successfully" });
  } catch (error) {
    logger.error("Delete Bingo Card Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Bingo card not found" });
    }
    res.status(500).json({
      error: "Failed to delete Bingo card",
      details: error.message,
    });
  }
};
exports.generateBingoCards = async (req, res) => {
  try {
    // Generate 200 Bingo Cards with numbers
    const promises = Array.from({ length: 200 }, async () => {
      return prisma.bingoCard.create({
        data: {
          numbers: generateBingoNumbers(),
        },
      });
    });

    await Promise.all(promises);
    res.status(201).send("200 Bingo Cards Generated!");
  } catch (error) {
    logger.error("Error generating Bingo cards:", error);
    res.status(500).json({
      message: "Failed to generate Bingo cards.",
      error: error.message,
    });
  }
};
exports.regenerateBingoCards = async (req, res) => {
  try {
    // Use a transaction to delete all existing and generate new cards in a single batch
    await prisma.$transaction(async (prisma) => {
      await prisma.bingoCard.deleteMany();

      const promises = Array.from({ length: 200 }, async () => {
        return prisma.bingoCard.create({
          data: {
            numbers: generateBingoNumbers(),
          },
        });
      });

      await Promise.all(promises);
    });

    res.status(201).send("200 Bingo Cards Regenerated!");
  } catch (error) {
    logger.error("Error regenerating Bingo cards:", error);
    res.status(500).json({
      message: "Failed to regenerate Bingo cards.",
      error: error.message,
    });
  }
};
exports.deleteAllBingoCards = async (req, res) => {
  try {
    await prisma.bingoCard.deleteMany();
    res.status(200).json({
      message: "All BingoCard entries have been deleted.",
    });
  } catch (error) {
    logger.error("Error deleting Bingo cards:", error);
    res.status(500).json({
      message: "Failed to delete Bingo cards.",
      error: error.message,
    });
  }
};

// STATISTICS
exports.listUserStatistics = async (req, res) => {
  const cacheKey = "listUserStatistics";
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const userStatistics = await prisma.userStatistics.findMany({
      select: {
        id: true,
        user: {
          select: {
            username: true,
          },
        },
        gamesPlayed: true,
        gamesWon: true,
        gamesLost: true,
        amountWon: true,
        dailyStats: true,
        weeklyStats: true,
        monthlyStats: true,
        yearlyStats: true,
        updatedAt: true,
      },
    });
    cache.set(cacheKey, userStatistics);
    res.status(200).json(userStatistics);
  } catch (error) {
    logger.error("List User Statistics Error:", error);
    if (error.code === "P2002") {
      res
        .status(409)
        .json({ error: "Conflict error: Unique constraint failed." });
    } else if (error.code === "P2025") {
      res.status(404).json({ error: "Not Found: No user statistics found." });
    } else {
      res.status(500).json({
        error: "Failed to retrieve user statistics due to a server error.",
      });
    }
  }
};
exports.fetchUserStatistics = async (req, res) => {
  
  const userId = Number(req.params.id);
  
  try {
    const statistics = await prisma.userStatistics.findUnique({
      where: { userId },
      select: {
        gamesPlayed: true,
        gamesWon: true,
        gamesLost: true,
        amountWon: true,
        dailyStats: true,
        weeklyStats: true,
        monthlyStats: true,
        yearlyStats: true,
        updatedAt: true,
      },
    });
    if (!statistics) {
      return res.status(404).json({ error: "User statistics not found" });
    }
    res.status(200).json(statistics);
  } catch (error) {
    logger.error("Fetch User Statistics Error:", error);
    if (error.code === "P2025") {
      res.status(404).json({ error: "User statistics not found." });
    } else {
      res.status(500).json({
        error: "Failed to retrieve user statistics due to a server error.",
      });
    }
  }
};
exports.deleteUserStatistics = async (req, res) => {
  const { userId } = req.query; // Get userId from query parameters
  const id = Number(userId);

  try {
    // Use a transaction for batch deletion of related entities
    await prisma.$transaction(async (prisma) => {
      // Check if user statistics exist
      const userStatistics = await prisma.userStatistics.findUnique({
        where: { userId: id },
      });

      if (!userStatistics) {
        throw new Error("User statistics not found.");
      }

      // Delete user statistics and related entries (if applicable)
      await prisma.userStatistics.delete({
        where: { userId: id },
      });

      // If there are related entities to delete, do so here (e.g., UserBingoCard)
      await prisma.userBingoCard.deleteMany({
        where: { userId: id },
      });
    });

    res.status(200).json({
      message: "User statistics deleted successfully",
    });
  } catch (error) {
    logger.error("Delete User Statistics Error:", error);
    if (error.message === "User statistics not found.") {
      res.status(404).json({ error: "User statistics not found" });
    } else if (error.code === "P2025") {
      res.status(404).json({ error: "User statistics not found." });
    } else {
      res.status(500).json({
        error: "Failed to delete user statistics due to a server error.",
      });
    }
  }
};

//BPS
// Admin controller to create a new bonus period
exports.createBonusPeriod = async (req, res) => {
  
  const {
    startDate,
    endDate,
    type,
    dateTimeInAMH,
    prizeDistribution,
    predefinedWinners,
    prizes,
    minGames,       // <-- New: Minimum games required for eligibility
    minDeposit,     // <-- New: Minimum deposit required for eligibility
    allowedStakes   // <-- New: Allowed stake IDs (array); if empty, then all stakes allowed
  } = req.body;
  // Validate required fields
  if (!startDate || !endDate || !type || !dateTimeInAMH) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newPeriod = await prisma.bonusPeriod.create({
      data: {
        startDate: new Date(startDate), // Expecting date in EAT
        endDate: new Date(endDate), // Expecting date in EAT
        type,
        dateTimeInAMH: dateTimeInAMH,
        status: "active",
        prizeDistribution,
        predefinedWinners:
          prizeDistribution === "PREDEFINED" || prizeDistribution === "BOTH"
            ? predefinedWinners
            : null,
        // Store the new eligibility criteria
        minGames: minGames,
        minDeposit: minDeposit,
        allowedStakes: allowedStakes,
        prizes: {
          create: prizes.map((prize) => ({
            rank: prize.rank,
            amount: prize.amount,
          })),
        },
      },
    });

    res.status(201).json({ success: true, period: newPeriod });
  } catch (error) {
    logger.error("Bonus period creation error:", error);

    // Handle Prisma known error codes
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A bonus period with these dates and type already exists",
      });
    } else {
      return res.status(500).json({ error: "Failed to create bonus period" });
    }
  }
};
exports.listBonusPeriods = async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Filtering options
    const search = req.query.search?.trim() || "";
    const status = req.query.status || ""; // Filter by status if provided
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Sorting options
    const sortBy = req.query.sortBy || "createdAt"; // Default sorting field
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc"; // Default sorting order

    // Build the filter and search options
    const where = {
      ...(status && { status }), // Filter by status if provided
      ...(startDate && endDate
        ? { startDate: { gte: startDate }, endDate: { lte: endDate } }
        : {}), // Filter by date range
      ...(search && {
        type: { contains: search, mode: "insensitive" }, // Search by type
      }),
    };

    // Define the order by fields based on the sortBy parameter
    const orderBy = {
      [sortBy]: sortOrder,
    };

    // Fetch bonus periods with filtering, sorting, and pagination
    const bonusPeriods = await prisma.bonusPeriod.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        orderBy,
        { startDate: sortOrder }, // Additional sorting based on startDate
        { endDate: sortOrder }, // Additional sorting based on endDate
      ],
      select: {
        id: true,
        startDate: true,
        endDate: true,
        type: true,
        status: true,
        createdAt: true,
        dateTimeInAMH: true,
        winners: true,
        prizeDistribution: true,
        predefinedWinners: true,
        minDeposit: true,
        minGames: true,
        allowedStakes: true,
      },
    });

    // Get the total number of bonus periods for pagination
    const totalBonusPeriods = await prisma.bonusPeriod.count({ where });

    const totalPages = Math.ceil(totalBonusPeriods / limit);

    const response = {
      bonusPeriods,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBonusPeriods,
        limit,
      },
    };

    // Store the response in cache
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    logger.error("List Bonus Periods Error:", error);
    res.status(500).json({ error: "Failed to retrieve bonus periods" });
  }
};
exports.fetchBonusPeriod = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query; // Get pagination parameters

  // Convert page and limit to integers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: "Invalid page or limit" });
  }

  try {
    // Fetch a single BonusPeriod by ID with related points information
    const bonusPeriod = await prisma.bonusPeriod.findUnique({
      where: { id: parseInt(id) }, // Ensure the id is an integer
      include: {
        points: {
          skip: (pageNum - 1) * limitNum, // Skip points based on pagination
          take: limitNum, // Limit the number of points fetched
          select: {
            createdAt: true, // Select the createdAt field
            userId: true, // Select the userId field
            points: true, // Select the points field

            user: {
              select: {
                username: true, // Select only the username field
              },
            },
            bonusPeriod:true
          },
        },
        prizes: {
          select: {
            id: true,
            rank: true,
            amount: true,
          },
        },
      },
    });

    if (!bonusPeriod) {
      return res.status(404).json({ error: "BonusPeriod not found" });
    }

    // Count total points for pagination information
    const totalPoints = await prisma.bonusPeriod.findUnique({
      where: { id: bonusPeriod.id }, // Count points related to this BonusPeriod
      select: { points: true },
    });

    res.status(200).json({
      bonusPeriod,
      pageInfo: {
        totalPoints: totalPoints.points.length,
        totalPages: Math.ceil(totalPoints.points.length / limitNum), // Calculate total pages
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    logger.error("Error fetching BonusPeriod:", error);
    res.status(500).json({ error: "Failed to retrieve BonusPeriod" });
  }
};
exports.deleteBonusPeriod = async (req, res) => {
  const { bonusPeriodId } = req.params;
  const id = Number(bonusPeriodId);

  try {
    // Find the BonusPeriod to ensure it exists
    const bonusPeriod = await prisma.bonusPeriod.findUnique({
      where: { id: id },
    });
    if (!bonusPeriod) {
      return res.status(404).json({ error: "Bonus Period not found" });
    }
    // Batch delete related BonusPoints and BonusPeriod in a transaction
    await prisma.$transaction([
      prisma.bonusPoint.deleteMany({ where: { bonusPeriodId: id } }),
      prisma.prize.deleteMany({ where: { bonusPeriodId: id } }),
      prisma.winner.deleteMany({ where: { bonusPeriodId: id } }),
      prisma.bonusPeriod.delete({ where: { id: id } }),
    ]);

    res.status(200).json({
      message: "Bonus Period and associated Bonus Points deleted successfully",
    });
  } catch (error) {
    logger.error("Delete Bonus Period Error:", error);

    // Prisma error handling
    if (error.code === "P2025") {
      res.status(404).json({ error: "Bonus Period not found" });
    } else {
      res.status(500).json({ error: "Failed to delete Bonus Period" });
    }
  }
};
exports.updateBonusPeriod = async (req, res) => {
  const id = Number(req.params.id);
  const { status, dateTimeInAMH, type } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    // Update only the status of the bonus period
    const updatedBonusPeriod = await prisma.bonusPeriod.update({
      where: { id },
      data: { status, dateTimeInAMH, type },
    });

    res.status(200).json({ bonusPeriod: updatedBonusPeriod });
  } catch (error) {
    logger.error("Update Bonus Period Error:", error);

    // Handle the case when the bonus period is not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Bonus period not found" });
    }

    res.status(500).json({ error: "Failed to update bonus period" });
  }
};

// Jackpot
exports.activeBonusPeriods = async (req, res) => {
  try {
    const bonusPeriods = await prisma.bonusPeriod.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        type: true,
        prizeDistribution: true,
        predefinedWinners: true,
      },
    });

    return res.status(200).json(bonusPeriods);
  } catch (error) {
    // General error handling for other kinds of errors
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
const getTopNPlayers = async (bonusPeriodId, number) => {
  const bonusPeriod = await prisma.bonusPeriod.findUnique({
    where: { id: bonusPeriodId },
    select: { minGames: true, minDeposit: true, allowedStakes: true }
  });
  const minGames = bonusPeriod.minGames ?? 0;
  const minDeposit = Number(bonusPeriod.minDeposit) ?? 0;
  return await prisma.bonusPoint.findMany({
    where: {
      bonusPeriodId,
      user: {
        bonusParticipations: {
          some: {
            bonusPeriodId,
            gamesPlayed: { gte: minGames },        // using greater than or equal to
            depositAmount: { gte: minDeposit },      // using greater than or equal to
            ...(bonusPeriod.allowedStakes && bonusPeriod.allowedStakes.length > 0
              ? { stakeIds: { hasSome: bonusPeriod.allowedStakes } }
              : {})
          }
        }
      }
    },
    orderBy: { points: "desc" },
    take: number,
    select: { userId: true, points: true },
  });
};
const selectWinners = (players, ranking) => {
  if (players.length === 0) {
    return []; // No players to select from
  }

  // Calculate weights for the players (higher-ranked players have higher chances)
  let weights = players.map((_, index) => 20 - index); // Weight based on rank (20 for top, 1 for 20th)

  const weightedRandomSelection = (availablePlayers, availableWeights) => {
    const totalWeight = availableWeights.reduce(
      (acc, weight) => acc + weight,
      0
    );
    let randomNum = Math.random() * totalWeight;

    for (let i = 0; i < availablePlayers.length; i++) {
      if (randomNum < availableWeights[i]) {
        // Remove and return selected player and corresponding weight
        availableWeights.splice(i, 1); // Remove the weight
        return availablePlayers.splice(i, 1)[0]; // Remove and return the player
      }
      randomNum -= availableWeights[i];
    }
  };

  const winners = [];
  const numWinners = Math.min(3, players.length); // Ensure we don't try to select more winners than available players

  for (let i = 0; i < numWinners; i++) {
    const winner = weightedRandomSelection(players, weights);
    winner.rank = ranking + i + 1; // Assign rank (1 for first, 2 for second, etc.)
    winners.push(winner);
  }

  return winners; // Returns the selected winners with ranks
};

const storePredefinedWinners = async (bonusPeriodId, topNPlayers) => {
  // Retrieve predefined prizes for the bonus period, ordered by rank ascending

  const predefinedPrizes = await prisma.prize.findMany({
    where: { bonusPeriodId },
    orderBy: { rank: "asc" },
    select: { rank: true, amount: true },
  });
  // Validate that the number of predefined winners does not exceed available prizes
  if (topNPlayers.length > predefinedPrizes.length) {
    throw new Error(
      "Number of predefined winners exceeds the number of available prizes."
    );
  }
  // Map top players to winners with rank and associated prize amount
  const winners = topNPlayers.map((player, index) => ({
    userId: player.userId,
    bonusPeriodId,
    rank: predefinedPrizes[index].rank,
    amountWon: predefinedPrizes[index].amount,
  }));
  const existingWinners = await prisma.winner.findMany({
    where: {
      bonusPeriodId,
    },
  });

  // If there are existing winners, raise an error or return a response
  if (existingWinners.length > 0) {
    return;
  }
  // Store the winners in the database
  await prisma.winner.createMany({
    data: winners,
  });
};
const storeWinners = async (bonusPeriodId, distribution, winners) => {
  try {
    // Check if winners already exist for the given bonusPeriodId
    if (distribution === "RANDOM") {
      const existingWinners = await prisma.winner.findMany({
        where: {
          bonusPeriodId,
        },
      });

      // If there are existing winners, raise an error or return a response
      if (existingWinners.length > 0) {
        return;
      }
    }

    // If no winners exist, proceed to create new winners
    const winnerData = winners.map((winner) => ({
      userId: winner.userId,
      bonusPeriodId,
      rank: winner.rank,
    }));

    await prisma.winner.createMany({
      data: winnerData,
    });
  } catch (error) {}
};
exports.drawWinners = async (req, res) => {
  const { bonusPeriodId } = req.params;
  const id = Number(bonusPeriodId);

  try {
    const period = await prisma.bonusPeriod.findUnique({
      where: { id: id },
      include: {
        winners: true,
      },
    });
    if (period.winners.length != 0) {
      return res.status(400).json({
        error: "Winners for this bonus period have already been drawn.",
      });
    }

    if (period.prizeDistribution === "PREDEFINED") {
      const topNPlayers = await getTopNPlayers(id, period.predefinedWinners);
      if (topNPlayers.length == 0) {
        return res.status(400).json({
          error: "No Players in this predefined period yet.",
        });
      }
      await storePredefinedWinners(period.id, topNPlayers);
    } else if (period.prizeDistribution === "BOTH") {
      const topNPlayers = await getTopNPlayers(id, period.predefinedWinners);
      if (topNPlayers.length == 0) {
        return res.status(400).json({
          error: "No Players in this predefined period yet.",
        });
      }
      await storePredefinedWinners(period.id, topNPlayers);
      const top20Players = await getTopNPlayers(id, 20);
      if (top20Players.length == 0) {
        return res.status(400).json({
          error: "No Players in this period yet.",
        });
      }
      // Step 2: Select winners
      const winners = selectWinners(
        [...top20Players],
        period.predefinedWinners
      ); // Make a copy for selection
      // Step 3: Store winners in database
      await storeWinners(id, period.prizeDistribution, winners);
    } else {
      // Step 1: Get top 20 players
      const top20Players = await getTopNPlayers(id, 20);
      if (top20Players.length == 0) {
        return res.status(400).json({
          error: "No Players in this period yet.",
        });
      }
      // Step 2: Select winners
      const winners = selectWinners([...top20Players], 0); // Make a copy for selection

      // Step 3: Store winners in database
      await storeWinners(id, period.prizeDistribution, winners);
    }
    const updatedPeriod = await prisma.bonusPeriod.findUnique({
      where: { id: id },
      include: {
        winners: {
          include: {
            user: {
              select: {
                id: true,
                userId: true,
                username: true,
                phoneNumber: true,
                amount: true,
                // Include any other user fields you want to retrieve
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Bonus period ended and winners selected successfully",
      updatedPeriod,
    });
  } catch (error) {
    // Check if the error is due to existing winners
    logger.error("Error drawing winners: ",error);
    res
      .status(500)
      .json({ error: "An error occurred while ending the bonus period." });
  }
};
exports.assignPrizes = async (req, res) => {
  try {
    const { winners } = req.body;

    // Validate the request body
    if (!winners || !Array.isArray(winners)) {
      return res.status(400).json({ error: "Invalid winners list." });
    }

    const results = [];

    // Process each winner
    for (const winner of winners) {
      const { userId, bonusPeriodId, amount, phoneNumber } = winner;

      if ((!userId, !bonusPeriodId, !phoneNumber || !amount)) {
        return res.status(400).json({
          error:
            "Each winner must have a phoneNumber, periodId, and amountWon.",
        });
      }

      // Find the winner's user record by phoneNumber
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: `User with phone number ${phoneNumber} not found.` });
      }

      // Find the winner record
      const winnerRecord = await prisma.winner.findFirst({
        where: {
          userId: user.id,
          bonusPeriodId: bonusPeriodId,
        },
      });

      if (!winnerRecord) {
        return res.status(404).json({
          error: `Winner record not found for user ${phoneNumber} and period ${periodId}.`,
        });
      }

      // Check if the prize has already been given
      if (winnerRecord.prizeGiven) {
        results.push({
          phoneNumber,
          message: "Prize already given",
        });
      } else {
        // Update the user's wallet
        await prisma.user.update({
          where: { id: user.id },
          data: {
            wallet: {
              increment: amount, // Add the prize amount to the user's wallet
            },
          },
        });

        // Mark the prize as given
        await prisma.winner.update({
          where: { id: winnerRecord.id },
          data: {
            amountWon: amount,
            prizeGiven: true,
            prizeGivenDate: new Date(),
          },
        });

        results.push({
          phoneNumber,
          message: "Prize successfully given",
        });
      }
    }

    // Return the result of the prize assignment
    return res.status(200).json({ results });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
exports.checkPeriod = async (req, res) => {
  const { periodId } = req.params;

  try {
    // Fetch winners for the given period
    const period = await prisma.bonusPeriod.findUnique({
      where: { id: Number(periodId) },
      include: {
        winners: {
          include: {
            user: true,
          },
        },
      },
    });

    const hasWinners = period.winners.length > 0;

    // Check if all prizes are given
    const allPrizesGiven = period.winners.every((winner) => winner.prizeGiven);

    res.json({
      winners: period.winners.map((winner) => ({
        id: winner.id,
        userId: winner.userId,
        bonusPeriodId: winner.bonusPeriodId,
        amountWon: winner.amountWon,
        createdAt: winner.createdAt,
        prizeGiven: winner.prizeGiven,
        prizeGivenDate: winner.prizeGivenDate,
        rank: winner.rank,
        user: {
          id: winner.user.id,
          username: winner.user.username,
          phoneNumber: winner.user.phoneNumber,
        },
      })),
      hasWinners,
      allPrizesGiven,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "An error occurred while checking winners" });
  }
};

// Transactions
exports.listTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const search = req.query.search?.trim() || "";
    const status = req.query.status || "";
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const sortBy = req.query.sortBy || "created_at";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const where = {
      ...(status && { status }),
      ...(startDate && endDate
        ? { created_at: { gte: startDate, lte: endDate } }
        : {}),
      ...(search && {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
          { tx_ref: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        event: true,
        username: true,
        mobile: true,
        currency: true,
        amount: true,
        status: true,
        reference: true,
        tx_ref: true,
        userWalletUpdated: true,
        created_at: true,
        updated_at: true,
      },
    });

    const totalTransactions = await prisma.transaction.count({ where });
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      transactions,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalTransactions,
        limit,
      },
    });
  } catch (error) {
    logger.error("List Transactions Error:", error);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
};

exports.fetchTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    logger.error("Fetch Transaction Error:", error);
    res.status(500).json({ error: "Failed to retrieve transaction" });
  }
};

// Withdrawals
exports.listPendingWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const status = req.query.status || null; // Filter by status
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
    // Define the base orderBy clause
    const orderBy =
      sortBy === "username" || sortBy === "phoneNumber" || sortBy === "wallet"
        ? { user: { [sortBy]: sortOrder } } // Nested sorting for related fields
        : { [sortBy]: sortOrder }; // Direct sorting for withdrawalRequest fields

    // Build search and filter criteria
    const where = {
      ...(status && { status }),
      OR: [
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { phoneNumber: { contains: search, mode: "insensitive" } } },
      ],
    };

    // Fetch pending withdrawals with filtering, sorting, and pagination
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
            wallet: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Get the total number of pending withdrawals for pagination
    const totalWithdrawals = await prisma.withdrawalRequest.count({ where });

    const totalPages = Math.ceil(totalWithdrawals / limit);

    const response = {
      pendingWithdrawals,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalWithdrawals,
        limit,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("List Pending Withdrawals Error:", error);
    res.status(500).json({ error: "Failed to retrieve pending withdrawals." });
  }
};
exports.approveWithdrawal = async (req, res) => {
  const { withdrawalRequestId } = req.body;

  if (!withdrawalRequestId) {
    return res
      .status(400)
      .json({ message: "withdrawalRequestId is required." });
  }

  try {
    // Fetch the withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalRequestId },
      include: { user: true },
    });

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    if (withdrawalRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Withdrawal request is not pending." });
    }

    const { user, amount, accountNumber, bankCode } = withdrawalRequest;

    if (Number(user.wallet) < Number(amount)) {
      return res.status(400).json({ message: "Insufficient user balance." });
    }

    // Proceed with the withdrawal using Chapa
    const tx_ref = `ref-${Date.now()}`;
    const payload = {
      account_number: accountNumber,
      amount: String(amount),
      currency: "ETB",
      reference: tx_ref,
      bank_code: bankCode,
    };

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
      // Deduct the amount from user's wallet
      await prisma.user.update({
        where: { id: user.id },
        data: { wallet: String(Number(user.wallet) - Number(amount)) },
      });

      // Update the withdrawal request status to APPROVED
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalRequestId },
        data: { status: "APPROVED" },
      });

      // Save the withdrawal transaction
      const transactionData = {
        event: "withdrawal",
        username: user.username,
        mobile: user.phoneNumber,
        currency: "ETB",
        amount: String(amount),
        charge: "0",
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
          description: "User withdrawal transaction approved by admin",
        },
        meta: {},
        userWalletUpdated: true,
        userId: user.id,
      };

      await prisma.transaction.create({
        data: transactionData,
      });

      // Track the withdrawal in WalletTransaction model
      await prisma.walletTransaction.create({
        data: {
          type: "WITHDRAWAL",
          amount: Number(amount),
        },
      });

      // Update the global wallet aggregate by decreasing the balance
      await prisma.walletAggregate.update({
        where: { id: 1 },
        data: {
          currentBalance: {
            decrement: Number(amount),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Withdrawal approved and processed successfully.",
        reference: tx_ref,
        updatedWallet: String(Number(user.wallet) - Number(amount)),
      });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to process withdrawal." });
    }
  } catch (error) {
    logger.error("Approve Withdrawal Error:", error);
    res.status(500).json({ error: "Failed to approve withdrawal." });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  const { withdrawalRequestId } = req.body;

  if (!withdrawalRequestId) {
    return res
      .status(400)
      .json({ message: "withdrawalRequestId is required." });
  }

  try {
    // Fetch the withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalRequestId },
      include: { user: true },
    });

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    if (withdrawalRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Withdrawal request is not pending." });
    }

    await prisma.withdrawalRequest.update({
      where: { id: withdrawalRequestId },
      data: { status: "REJECTED" },
    });
    res.status(200).json({
      success: true,
      message: "Withdrawal approved and processed successfully.",
    });
  } catch (error) {
    logger.error("Reject Withdrawal Error:", error);
    res.status(500).json({ error: "Failed to reject withdrawal." });
  }
};
