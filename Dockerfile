# syntax=docker/dockerfile:1.7

# ---- Stage 1 : install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# ---- Stage 2 : build / runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

RUN apk add --no-cache wget && \
    addgroup -S app && adduser -S app -G app

COPY --chown=app:app --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .
RUN chmod +x docker-entrypoint.sh

USER app

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3001/incidents > /dev/null 2>&1 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
