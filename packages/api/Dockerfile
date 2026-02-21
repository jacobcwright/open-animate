# ---------- build ----------
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY tsup.config.ts tsconfig.json ./
COPY src/ src/
RUN pnpm build

# ---------- runtime ----------
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist/ dist/
COPY drizzle/ drizzle/

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "dist/index.js"]
