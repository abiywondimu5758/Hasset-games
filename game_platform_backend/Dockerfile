
# Use a base image with Node.js
FROM node:18-alpine

# Install dependencies required for Prisma (including OpenSSL 3)
RUN apk update && apk add --no-cache \
    openssl3 \
    bash

# Set the working directory in the container
WORKDIR /src

# Install dependencies only for production
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of your application code (including .env and schema.prisma)
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./schema.prisma


# Expose the port your app runs on
EXPOSE 5000

# Start the application with PM2
CMD ["npx", "pm2-runtime", "start", "src/server.js", "--name", "game_platform_backend"]
