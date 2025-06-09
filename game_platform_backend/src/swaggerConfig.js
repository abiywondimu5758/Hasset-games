const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for your Express application",
    },
    servers: [
      {
        url: "http://localhost:5000", // Update with your server URL if needed
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Ensure this path is correct
};

const swaggerSpec = require("swagger-jsdoc")(options);
module.exports = swaggerSpec;
