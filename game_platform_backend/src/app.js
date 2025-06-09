const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

const app = express();

// Configure CORS with allowed origins for production use
app.use(
  cors({
    origin: "*", // In production, specify allowed origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Handle preflight requests
app.options("*", cors());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const statRoutes = require("./routes/statRoutes");
const rolesRoutes = require("./routes/roleRoutes");
const paymentRoutes = require('./routes/paymentRoutes');

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/games", gameRoutes);
app.use("/stats", statRoutes);
app.use("/roles", rolesRoutes);
app.use('/payment', paymentRoutes);


module.exports = app;
