const prisma = require("../config/prismaClient");
const logger = require('../helper/logger');
const NodeCache = require("node-cache");
exports.createGame = async (req, res) => {
  const { title, description, picture } = req.body;
  try {
    // Validate required fields
    if (!description || !title) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Attempt to create a new game
    const newGame = await prisma.game.create({
      data: {
        title,
        description,
        picture,
      },
    });

    res.status(201).json({ message: "Game created", game: newGame });
  } catch (error) {
    logger.error("Game creation error:", error);
    
    // Improved error handling based on Prisma error codes
    if (error.code === "P2002") { // Unique constraint violation
      res.status(400).json({ error: "Game with this title already exists" });
    } else {
      // Generic server error
      res.status(500).json({ error: "Game creation failed due to a server issue" });
    }
  }
};


const cache = new NodeCache({ stdTTL: 86400 }); // 24 hours in seconds
exports.getGames = async (req, res) => {
  try {
    const cacheKey = "games";
    const cachedGames = cache.get(cacheKey);

    if (cachedGames) {
      return res.json({ games: cachedGames });
    }

    const games = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        picture: true,
      },
    });

    // Check if any games are found
    if (!games || games.length === 0) {
      return res.status(404).json({ error: "No games found" });
    }

    cache.set(cacheKey, games);
    res.json({ games });
  } catch (error) {
    logger.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games due to a server issue" });
  }
};


exports.getGame = async (req, res) => {
  try {
    const { id } = req.params; // Retrieve the game ID from the request parameters
    const cacheKey = `game_${id}`;
    const cachedGame = cache.get(cacheKey);

    if (cachedGame) {
      return res.json({ game: cachedGame });
    }

    // Fetch the game with the specified ID
    const game = await prisma.game.findUnique({
      where: { id: parseInt(id, 10) }, // Ensure the ID is an integer
      select: {
        id: true,
        title: true,
        description: true,
        picture: true,
      },
    });

    // Check if the game exists
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    cache.set(cacheKey, game, 86400); // Cache the game for 24 hours
    res.json({ game });
  } catch (error) {
    logger.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game due to a server issue" });
  }
};

