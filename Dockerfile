# ---- deps ----
FROM node:20-alpine AS deps
# Algunas dependencias nativas (p. ej. sharp/unrs-resolver) necesitan glibc-compat en Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# El proyecto usa pnpm (ver "packageManager" en package.json); corepack instala esa versión exacta.
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

# Con output: "standalone", Next genera un server.js mínimo con solo las
# dependencias trazadas; public y .next/static deben copiarse a mano.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
