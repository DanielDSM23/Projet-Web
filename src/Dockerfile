FROM node:24-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# --- BUILDER STAGE ---
FROM base as builder
WORKDIR /app
COPY . .
# We generate prisma client here so it's available in node_modules
RUN npx prisma generate
RUN npm run build

# --- PRODUCTION STAGE ---
FROM base as production
WORKDIR /app
ENV NODE_ENV=production
RUN npm ci

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD ["npm", "start"]

# --- DEVELOPMENT STAGE ---
FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
RUN npx prisma generate

# Use CMD (runtime) instead of RUN (buildtime)
# This allows the container to wait for the DB to be up
CMD npx prisma migrate dev --name init && npm run dev