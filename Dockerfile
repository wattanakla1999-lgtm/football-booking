# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*


FROM base AS dependencies

COPY package.json package-lock.json ./

RUN npm ci


FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=app_env,target=/run/secrets/app_env,required=true \
    cp /run/secrets/app_env /app/.env \
    && npm run build \
    && rm -f /app/.env \
    && find /app/.next/standalone -type f -name ".env*" -delete

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]