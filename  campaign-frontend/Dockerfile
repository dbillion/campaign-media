# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install -g yarn@1.22.22 --force && \
    yarn

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production environment
FROM node:18-alpine
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app ./

# Expose port
EXPOSE 4173

# Start the application
CMD ["yarn", "serve"]
