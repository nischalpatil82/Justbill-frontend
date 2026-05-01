# Stage 1: Build the Angular application
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application
FROM node:20-slim

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on (usually 4000 for SSR)
EXPOSE 4000

# Start the server
CMD ["node", "dist/multikart-frontend/server/main.js"]
