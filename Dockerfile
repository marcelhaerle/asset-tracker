# Use the official Node.js 22-alpine image as the base image
FROM node:22-alpine AS base

# Set the working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./
RUN npm install
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run build:scripts

# Production image, copy all the files and run the application
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user and switch to it
RUN addgroup -S nextjs && adduser -S -G nextjs nextjs
USER nextjs

# Copy the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nextjs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nextjs /app/dist ./dist
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./
COPY --from=builder --chown=nextjs:nextjs /app/package-lock.json ./
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "npm run db:deploy && node server.js"]
