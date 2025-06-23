# Use Node.js 20 alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies needed for gRPC
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate gRPC stubs
RUN npm run generate:grpc

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S banking -u 1001

# Change ownership of the app directory
RUN chown -R banking:nodejs /app
USER banking

# Expose the gRPC server port
EXPOSE 50052

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "test:integration"]