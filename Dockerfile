# Use official Bun image
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Run the server
CMD ["bun", "run", "index.ts"]

