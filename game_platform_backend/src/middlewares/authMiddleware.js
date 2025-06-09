require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient'); // Use existing instance
const rateLimit = require('express-rate-limit');

const logger = require('../helper/logger');

// Set up rate limiting for invalid token attempts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`
  message: { error: 'Too many invalid token attempts, please try again later' },
  keyGenerator: (req) => req.ip, // Limit based on client IP
  handler: (req, res) => {
    logInvalidTokenAttempt(req, 'Rate limit exceeded');
    res.status(429).json({ error: 'Too many invalid token attempts, please try again later' });
  },
});

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logInvalidTokenAttempt(req, 'Authorization token missing or malformed');
    return res.status(401).json({ error: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      logInvalidTokenAttempt(req, 'User not found for the given token');
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach the user's details, including role, to the req object
    req.user = {
      id: user.id,
      role: user.role,
    };

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    // Log the exact reason for the JWT failure
    logInvalidTokenAttempt(req, `Invalid or expired token: ${error.message}`);
    return res.status(401).json({ status:401, error: 'Invalid or expired token' });
  }
};

// Log invalid token attempts for better monitoring
const logInvalidTokenAttempt = (req, message) => {
  const logDetails = {
    ip: req.ip,
    path: req.originalUrl,
    time: new Date().toISOString(),
    message,
    userAgent: req.get('User-Agent') || 'Unknown',
  };

  logger.error('Invalid token attempt: ', logDetails);
};

module.exports = { authMiddleware, limiter };
