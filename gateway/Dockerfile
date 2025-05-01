# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production && \
    apk add --no-cache wget

# Copy all necessary files
COPY --from=builder /app/dist ./dist
COPY src/schema ./dist/schema
COPY --from=builder /app/src/services ./dist/services
COPY --from=builder /app/src/utils ./dist/utils
COPY --from=builder /app/src/middleware ./dist/middleware

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["npm", "start"] 