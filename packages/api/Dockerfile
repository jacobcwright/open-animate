# ---------- build ----------
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root lockfile + package manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/api/package.json packages/api/

# Install only the api package deps
RUN pnpm install --frozen-lockfile --filter @oanim/api

WORKDIR /app/packages/api
COPY packages/api/tsup.config.ts packages/api/tsconfig.json ./
COPY packages/api/src/ src/
RUN pnpm build

# ---------- runtime ----------
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/api/package.json packages/api/

RUN pnpm install --frozen-lockfile --prod --filter @oanim/api

WORKDIR /app/packages/api
COPY --from=build /app/packages/api/dist/ dist/
COPY packages/api/drizzle/ drizzle/

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "dist/index.js"]
