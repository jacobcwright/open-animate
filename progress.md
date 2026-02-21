# Progress Log

Append-only log of work completed each session.

---

## Session 1 — 2026-02-20

### Initial implementation (Plan Steps 1–11)

**Repo scaffolding:**
- Created pnpm workspace root with `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, Apache 2.0 `LICENSE`
- Initialized git, created GitHub repo `jacobcwright/open-animate` (public)

**@oanim/core package:**
- 7 spring presets (snappy, bouncy, gentle, stiff, wobbly, smooth, poppy)
- 5 easing presets wrapping Remotion's `Easing` API
- 8 element animation functions (fadeUp, fadeDown, slideInLeft, slideInRight, popIn, blurIn, elasticScale, perspectiveRotateIn)
- Helper utilities: `springValue()`, `springInterpolate()`
- 14 scene transition presets for `@remotion/transitions` TransitionSeries (fadeBlur, scaleFade, clipCircle, clipPolygon, wipe, splitHorizontal, splitVertical, perspectiveFlip, morphExpand, zoomThrough, pushLeft, pushRight, slideLeft, slideRight)
- 3 typography components: AnimatedCharacters, TypewriterText, CountUp
- 8 UI components: SafeArea, Background, GlowOrb, Terminal, Card, Badge, Grid, Vignette
- Design tokens: 5 color palettes, font stacks, spacing scale
- Fixed TypeScript generics for TransitionPresentation (Remotion requires `extends Record<string, unknown>`)

**oanim CLI:**
- `oanim init [name]` — scaffolds Remotion project with @oanim/core, detects package manager
- `oanim render` — reads scene.json, merges CLI flags, shells to `npx remotion render`
- `oanim assets` — 4 subcommands (gen-image, edit-image, remove-bg, upscale) via fal.ai REST API
- scene.json Zod schema + loader

**Examples:**
- `examples/hello-world` — minimal single-scene composition
- `examples/launch-video` — 4-scene product launch (Hook, ProductHero, Features, CTA) with TransitionSeries

**Agent skill:**
- `skill/SKILL.md` — overview and workflow
- 5 rule files: workflow, scene-config, composition-patterns, animation-cookbook, asset-generation
- 5 example reference docs: launch-video, explainer, logo-reveal, meme-caption, investor-update

**Build verified:** `pnpm install && pnpm build` succeeds, `oanim --help` works, types generated.

**Pushed** initial commit to `github.com/jacobcwright/open-animate` on `main`.

---

## Session 2 — 2026-02-21 (early)

### Finalize remaining tickets (OANIM-012 through OANIM-016)

**4 additional examples (OANIM-012):**
- `examples/logo-reveal` — 5s single-scene, showcases popIn with bouncy spring + GlowOrb
- `examples/meme-caption` — 6s vertical 1080x1920, showcases fadeDown + vertical format
- `examples/explainer` — 20s 4-scene with wipe transitions, reusable Step component + Grid
- `examples/investor-update` — 15s 3-scene with scaleFade transitions, CountUp + Card stagger, palettes.ocean

**Bug fix — fal.ai response parsing:**
- `birefnet` and `creative-upscaler` return `{ image: { url } }` not `{ images: [{ url }] }`
- Added `getImageUrl()` helper to handle both response shapes
- All 4 asset commands now work: gen-image, edit-image, remove-bg, upscale

**Live fal.ai testing (OANIM-015):**
- gen-image: 1024x576 JPEG from text prompt
- edit-image: modified input image with prompt
- remove-bg: RGBA PNG with transparent background
- upscale: 2048x1152 (2x the 1024x576 input)
- Error handling verified (missing OANIM_FAL_KEY)

**E2E pipeline test (OANIM-016):**
- `oanim init test-project` scaffolds package.json, scene.json, tsconfig.json, src/{index.ts, Root.tsx, MyComp.tsx}
- `pnpm install && pnpm build` succeeds with all 6 examples in workspace

**README.md (OANIM-013):**
- Badge, quickstart, architecture, @oanim/core highlights, CLI commands table, examples list, agent skill section

**v0.1.0 release (OANIM-014):**
- All 16/16 tickets done
- Tagged v0.1.0, pushed to GitHub with release

---

## Session 3 — 2026-02-21

### ASCII art branding (OANIM-017)

- Added `splashBanner()` to `packages/cli/src/lib/output.ts` — 5-line block ASCII art "oanim" with indigo→violet chalk hex gradient
- Called `splashBanner()` at start of `oanim init` action in `packages/cli/src/commands/init.ts`
- Modified `preAction` hook in `packages/cli/src/index.ts` to skip the small banner when running `init` (splash handles it)
- Added ASCII art code block to top of `skill/SKILL.md`
- Build verified: `pnpm build` succeeds

---

## Session 4 — 2026-02-21

### Restructure repo for platform evolution (OANIM-018)

**CLI source updates (Phase 1):**
- `packages/cli/src/lib/scene.ts` — reads `animate.json` instead of `scene.json`
- `packages/cli/src/lib/fal.ts` — `OANIM_FAL_KEY` → `ANIMATE_FAL_KEY`
- `packages/cli/src/commands/init.ts` — writes `animate.json` instead of `scene.json`
- `packages/cli/src/commands/render.ts` — description + error messages reference `animate.json`

**Example renames (Phase 2):**
- All 6 `examples/*/scene.json` → `examples/*/animate.json` via `git mv`

**Skill directory restructure (Phase 3):**
- `skill/` → `animate-skill/`
- `animate-skill/rules/` → `animate-skill/references/`
- `animate-skill/examples/` → `animate-skill/templates/`
- Updated all internal .md references (path refs, scene.json → animate.json, OANIM_FAL_KEY → ANIMATE_FAL_KEY)

**Root documentation (Phase 4):**
- `CLAUDE.md` — comprehensive rewrite with platform vision (open-core model, media gateway, auth, cloud rendering), naming conventions table, planned packages (gateway, auth)
- `prd.json` — added OANIM-018 (done) + 4 platform tickets: OANIM-019 (auth), OANIM-020 (media gateway), OANIM-021 (API key resolution), OANIM-022 (cloud rendering)
- `README.md` — updated all references: scene.json → animate.json, OANIM_FAL_KEY → ANIMATE_FAL_KEY, skill/ → animate-skill/

**Build verified:** `pnpm build` succeeds

---

## Session 5 — 2026-02-21

### Platform features: OANIM-019 through OANIM-022

**Credential storage + API key resolution (OANIM-021):**
- New `packages/cli/src/lib/config.ts` — reads/writes `~/.oanim/credentials.yaml` (0o600) and `~/.oanim/config.yaml`
- `getAuth()` resolution chain: `ANIMATE_API_KEY` env → `credentials.yaml` api_key → `credentials.yaml` token → null
- `getApiUrl()`: `ANIMATE_API_URL` env → config file → `https://api.oanim.dev`
- Added `yaml@^2.3.0` dependency

**Media gateway + fal.ai provider adapter (OANIM-020):**
- New `packages/cli/src/lib/providers/types.ts` — `MediaProvider` interface (generateImage, editImage, removeBackground, upscale)
- New `packages/cli/src/lib/providers/fal.ts` — `FalProvider` class extracted from old `lib/fal.ts`
- New `packages/cli/src/lib/gateway.ts` — `MediaGateway` orchestrator with cost tracking + `ANIMATE_MAX_USD_PER_RUN` limit
- Updated `packages/cli/src/commands/assets.ts` to use `MediaGateway` instead of direct fal.ts imports
- Deleted `packages/cli/src/lib/fal.ts` (replaced by providers/fal.ts + gateway.ts)

**Auth commands (OANIM-019):**
- New `packages/cli/src/lib/http.ts` — `HttpClient` class for platform API calls
- New `packages/cli/src/commands/login.ts` — browser OAuth: find port → start callback server → open browser → save token
- New `packages/cli/src/commands/whoami.ts` — display current user via `GET /api/v1/auth/me`
- New `packages/cli/src/commands/logout.ts` — clear stored credentials
- Updated `packages/cli/src/index.ts` — registered 3 new commands, skip banner for login/logout/whoami
- Added `open@^10.0.0` dependency

**Cloud rendering (OANIM-022):**
- New `packages/cli/src/lib/cloud-render.ts` — submit, poll, download, waitForRender with progress callback
- Updated `packages/cli/src/commands/render.ts` — `--cloud` flag: requires auth → upload → poll → download MP4

**Build verified:** `pnpm build` and `tsc --noEmit` both succeed

---

## Session 6 — 2026-02-21 (early)

### Backend API: Convex + Remotion Lambda (OANIM-023, OANIM-024, OANIM-029)

**New package: `packages/api/` — Convex backend:**
- `convex/schema.ts` — 4 tables: `users`, `apiKeys`, `renderJobs`, `loginStates` with indexes
- `convex/auth.config.ts` — Clerk auth provider configuration
- `convex/lib/security.ts` — `generateApiKey()` (anim_ prefix, SHA-256 hash), `hashApiKey()`, `verifyApiKey()`
- `convex/lib/auth.ts` — `authenticateRequest()` (API key + Clerk JWT), `authenticateAndTrack()` (also updates lastUsedAt)
- `convex/users.ts` — `findOrCreateByClerkId`, `getById`, `getByClerkId` mutations/queries
- `convex/apiKeys.ts` — `create` (max 10 per user), `listByUser`, `deleteKey`, `verify`
- `convex/loginStates.ts` — `create`, `getByState`, `remove`, `cleanupExpired`
- `convex/renderJobs.ts` — `create`, `get`, `updateStatus`, `listByUser`
- `convex/renderAction.ts` — Node action ("use node"): downloads tarball from Convex storage, extracts, uploads to S3, calls `renderMediaOnLambda()`, polls progress, stores MP4 in Convex storage
- `convex/crons.ts` — cleanup expired loginStates every 15 minutes
- `convex/http.ts` — Hono router with all REST endpoints:
  - Auth: `GET /api/v1/auth/cli/login`, `/sign-in` (Clerk widget HTML), `/callback` (JWT verify via jose + JWKS, create user, generate API key, redirect to CLI), `/me`
  - API Keys: `GET/POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:keyId`
  - Render: `POST /api/v1/render/upload`, `POST /api/v1/render`, `GET /api/v1/render/:jobId`, `GET /api/v1/render/:jobId/download`

**CLI modifications:**
- `login.ts` — callback now receives `?key=` param, saves as `api_key` (not `token`) in credentials.yaml
- `http.ts` — handles 204 No Content, added `uploadBlob()` method for tarball uploads
- `cloud-render.ts` — rewritten: runs `npx remotion bundle`, tars output, uploads to `/api/v1/render/upload`, then submits render job with `bundleStorageId`
- New `commands/api-keys.ts` — `oanim api-keys create --name <name>`, `list`, `revoke <id>`
- `index.ts` — registered `apiKeysCommand`, added `'api-keys'` to SKIP_BANNER set

**Build verified:** `pnpm build` succeeds

---

## Session 7 — 2026-02-21

### Replace Convex with Hono + Drizzle + pg-boss + Remotion Lambda (OANIM-030)

**Motivation:** Convex creates vendor lock-in that conflicts with the open-core (Supabase model) vision. Users need to self-host. Replaced with standard, self-hostable infra.

**Deleted:** Entire `packages/api/convex/` directory (Convex schema, mutations, queries, actions, HTTP router)

**New `packages/api/` stack:**
- **Hono** HTTP server with `@hono/node-server` (same REST API shape)
- **Drizzle ORM** + PostgreSQL (4 tables: users, apiKeys, renderJobs, loginStates)
- **pg-boss** job queue (same Postgres, render job processing)
- **S3** for bundle tarballs + rendered MP4s (replaces Convex Storage)
- **Remotion Lambda** for cloud rendering (unchanged)

**New file structure:**
- `src/db/schema.ts` — Drizzle tables with uuid PKs, enums, indexes
- `src/db/index.ts` — pg Pool + drizzle instance
- `src/lib/security.ts` — generateApiKey, hashApiKey, verifyApiKey (ported from Convex)
- `src/lib/auth.ts` — Hono middleware: API key + Clerk JWT (jose/JWKS)
- `src/lib/s3.ts` — S3 client + upload/presign/download/delete helpers + uploadDirToS3
- `src/lib/boss.ts` — pg-boss init
- `src/routes/auth.ts` — 3 endpoints: `/cli/login` (serves Clerk sign-in HTML directly), `/cli/callback`, `/me`
- `src/routes/api-keys.ts` — GET, POST, DELETE /api/v1/api-keys
- `src/routes/render.ts` — POST /upload, POST /, GET /:jobId, GET /:jobId/download
- `src/workers/render.ts` — pg-boss handler: S3 → Remotion Lambda → poll → update DB
- `src/index.ts` — Hono app + pg-boss start + serve
- `docker-compose.yml` — Postgres 15
- `drizzle.config.ts` — Drizzle Kit config
- `.env.example` — all required env vars

**CLI changes:**
- `cloud-render.ts` — `storageId` → `storageKey`, `bundleStorageId` → `storageKey` in request body

**Endpoints preserved (same shape):**
- Auth: `GET /api/v1/auth/cli/login`, `/cli/callback`, `/me`
- API Keys: `GET/POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:keyId`
- Render: `POST /upload`, `POST /render`, `GET /:jobId`, `GET /:jobId/download`

**Build verified:** `pnpm build` succeeds (all 3 packages: core, cli, api)

---

## Session 8 — 2026-02-21

### Usage reporting — gateway metrics to platform API (OANIM-027)

**DB schema:**
- Added `usageRecords` table to `packages/api/src/db/schema.ts` — uuid PK, userId FK, provider, model, operation, estimatedCostUsd (numeric 10,6), createdAt
- Index on `(userId, createdAt)` for aggregation queries

**API routes (`packages/api/src/routes/usage.ts`):**
- `POST /api/v1/usage` (requireAuth) — bulk-insert usage records, returns `{ inserted: N }`
- `GET /api/v1/usage?days=30` (requireAuth) — daily-aggregated usage with totalCostUsd

**CLI gateway reporting (`packages/cli/src/lib/gateway.ts`):**
- `reportUsage()` fires after each `track()` call — fire-and-forget POST to `/api/v1/usage`
- Graceful degradation: skips if not logged in (`getAuth()` returns null), silently ignores API errors
- Asset generation works identically with or without auth

**Build verified:** `pnpm build` succeeds

### Agent-native onboarding (OANIM-032, OANIM-033, OANIM-034)

**Headless auth — `oanim login --token` (OANIM-032):**
- Added `--token <key>` option to `packages/cli/src/commands/login.ts`
- Verifies key via `GET /api/v1/auth/me` before saving to credentials.yaml
- Agents/CI can authenticate without a browser: `oanim login --token anim_xxx`
- Browser OAuth remains the default when no `--token` flag is passed

**Free credit seeding (OANIM-033):**
- Added `creditBalanceUsd` column to `users` table (numeric 10,4, default `$5.00`)
- New users automatically get $5.00 free credits on account creation
- `GET /api/v1/auth/me` now includes `credit_balance_usd` in response
- `POST /api/v1/usage` deducts from credit balance using `GREATEST(balance - cost, 0)`

**Credit limit enforcement (OANIM-034):**
- Added `GET /api/v1/usage/balance` endpoint returning remaining credits
- Gateway checks balance before each operation (fetched once, tracked locally)
- Clear error: "Insufficient credits: $X remaining, but this operation costs ~$Y"
- Graceful degradation: unauthenticated users and network errors silently skipped

**Build verified:** `pnpm build` succeeds
