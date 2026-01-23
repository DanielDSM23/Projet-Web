FROM node:24-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# --- BUILDER STAGE ---
FROM base as production
WORKDIR /app
COPY . .
RUN npm install
# We generate prisma client here so it's available in node_modules
RUN DATABASE_URL="postgres://localhost:5432/dummy" npx prisma generate
RUN DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}" npx prisma migrate deploy
CMD npx next dev -p 80 -H 0.0.0.0

# --- PRODUCTION STAGE ---
# FROM base as production
# WORKDIR /app
# ENV NODE_ENV=production
# RUN npm ci

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001
# USER nextjs

# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/public ./public

# CMD npm start

# --- DEVELOPMENT STAGE ---
FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
RUN DATABASE_URL="postgres://localhost:5432/dummy" npx prisma generate

# Use CMD (runtime) instead of RUN (buildtime)
# This allows the container to wait for the DB to be up
CMD npm run dev
