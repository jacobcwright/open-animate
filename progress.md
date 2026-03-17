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

## Session 8 — 2026-02-21 (early)

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

---

## Session 9 — 2026-02-21

### Deployment artifacts for API server (OANIM-031)

**Auto-migrate on startup:**
- Added `drizzle-orm/node-postgres/migrator` import to `packages/api/src/index.ts`
- `migrate(db, { migrationsFolder: './drizzle' })` runs before pg-boss starts
- Server self-migrates on deploy — no separate migration step needed

**Drizzle migrations generated:**
- Ran `pnpm db:generate` → `drizzle/0000_illegal_kang.sql`
- Creates all 5 tables (users, api_keys, render_jobs, usage_records, login_states), enum, indexes, FKs
- Migration meta files in `drizzle/meta/`

**Dockerfile (multi-stage):**
- Build stage: Node 20 alpine, pnpm, `pnpm install --frozen-lockfile`, `pnpm build`
- Runtime stage: Node 20 alpine, prod-only `node_modules`, `dist/`, `drizzle/`
- CMD: `node dist/index.js`, exposes port 8000

**tsup externals:**
- Added `external` array to `tsup.config.ts`: pg, pg-boss, @aws-sdk/*, @remotion/lambda
- These native/binary deps load from `node_modules` at runtime instead of being bundled

**.dockerignore:** Excludes node_modules, dist, src, .env, .git, config files

**Build verified:** `pnpm build` succeeds

---

## Session 10 — 2026-02-22

### E2E Verification of oanim API (api.oanim.dev)

Full end-to-end testing of the deployed API on Porter. API is live at `https://api.oanim.dev`.

**Phase 1 — Setup:**
- Built all packages (`pnpm build` succeeds)
- Linked CLI globally via `npm link` (pnpm link had PNPM_HOME issues)
- `oanim --help` works

**Phase 2 — Auth flow (3 bugs found and fixed):**

Bug 1: **Clerk OAuth redirect to root (404).** `afterSignInUrl` is deprecated in Clerk v5+. The `@clerk/clerk-js@latest` script ignored it and redirected to `/` (the origin root), which returned 404.
- Fix: Replaced `afterSignInUrl` with `forceRedirectUrl` (modern Clerk API)
- Fix: Added client-side token bridge page — when callback receives no token, serves HTML that loads Clerk, extracts JWT from active session, and re-submits to the same URL with `?token=`

Bug 2: **`http://` callback URLs behind reverse proxy.** `new URL(c.req.url).origin` returned `http://api.oanim.dev` because TLS terminates at Porter's load balancer.
- Fix: Derive base URL from `c.req.header('host')` with hardcoded `https://`

Bug 3: **Empty email in user record.** Clerk JWTs don't include email in standard claims (`sub` only). The code tried `payload.email` and `payload.primary_email_address` which were both undefined.
- Fix: Extract email client-side from `window.Clerk.user.primaryEmailAddress.emailAddress` and pass as `&email=` query param to callback

All 3 fixes committed and deployed: `4bd797a`, `30bf880`

**Phase 3 — Auth verification (PASS):**
- `oanim login` — opens browser, Clerk sign-in, API key saved to `~/.oanim/credentials.yaml`
- `oanim whoami` — shows email, credits ($5.00), ID, member since date
- `curl /api/v1/auth/me` with saved key — returns JSON with id, email, credit_balance_usd, created_at
- Credentials file has `api_key: anim_...` format

Note: Also added `credit_balance_usd` to whoami output (was missing).

**Phase 4 — API key management (PASS):**
- `oanim api-keys create --name "test-key"` — displays key with `anim_` prefix
- `oanim api-keys list` — shows all keys (2 CLI login + 1 test)
- `curl /api/v1/auth/me` with test key — authenticated successfully
- `oanim api-keys revoke {id}` — revoked test key
- `curl` with revoked key — returns 401 `{"error":"Not authenticated"}`

**Phase 5 — Usage endpoints (PASS):**
- `GET /api/v1/usage?days=30` — `{"usage":[],"totalCostUsd":0}` (no usage yet)
- `GET /api/v1/usage/balance` — `{"creditBalanceUsd":5}`

**Phase 6 — Cloud rendering (BLOCKED — pg-boss worker not processing jobs):**
- Upload + job creation works: `POST /render/upload` returns storageKey, `POST /render` returns job_id
- Job stays at `status: "queued"` indefinitely — pg-boss worker never picks it up
- Porter logs confirm worker registered: `[pg-boss] started` → `[worker] render worker registered` → `[oanim-api] listening`
- No worker error logs appear — the worker handler is never invoked
- Tested with 2 separate jobs across 2 deploys (v11, v12) — same result
- Added diagnostic endpoint (`GET /debug/queue`) and verbose worker logging, deployed as v13
- Investigation ongoing

**Phase 7 — Cleanup (not started, blocked on Phase 6):**
- `oanim logout` / `oanim whoami` verification deferred

### pg-boss debugging (continued)

**Finding 1 — `boss.send()` was returning null:**
- Added `/debug/queue` diagnostic endpoint
- Initial attempt used `await import('./lib/boss.js')` (dynamic import) — this created a SEPARATE module instance from the bundled code (tsup bundles to single file, dynamic imports resolve differently). Fixed to use static `import { getBoss }`.
- Even with correct singleton, `send()` returned null and `getQueueSize()` returned 0.

**Finding 2 — pg-boss v10 breaking change: explicit queue creation required:**
- In pg-boss v9, queues were created implicitly on first `send()`. In v10, `createQueue(name)` must be called first.
- Without it: `send()` silently returns null, `work()` registers but never fires, `getQueueSize()` returns 0.
- Fix: Added `boss.createQueue('render')` to `startBoss()` in `packages/api/src/lib/boss.ts`.
- After fix: `send()` returns real UUIDs, `getQueueSize()` returns 1 after send.

**Finding 3 — worker still not picking up jobs:**
- Even with queue created and jobs visible in queue, `boss.work('render', ...)` handler never fires.
- `boss.fetch('render')` returns an empty-looking object (`{}`) — likely a pg-boss v10 API shape change.
- Latest diagnostic (v18, commit ad76afa): sends job, fetches it, returns raw result with Object.keys() for inspection.
- Awaiting deploy to see raw fetch shape — this will reveal if the v10 job format changed.

**Commits pushed:**
- `4bd797a` — fix: Clerk OAuth redirect (forceRedirectUrl, https://, token bridge)
- `30bf880` — fix: email from Clerk client-side, credits in whoami
- `3ae0ce2` — debug: queue diagnostic + worker logging
- `3f43fa9` — debug: boss.send return value logging
- `5abe01c` — debug: fix static import for getBoss
- `a0a59de` — fix: createQueue('render') for pg-boss v10
- `c5edbec` — debug: test send to render queue + list queues
- `728f418` — debug: test manual fetch
- `ad76afa` — debug: raw fetch result inspection

### Cloud rendering fix (continued from Session 10)

**Finding 4 — pg-boss v10 work() handler receives array, not single job:**
- pg-boss v10 always passes an **array** of jobs to `work()` handlers, even for single jobs.
- Our code: `async (job) => { ... job.data ... }` — `job` was the array, `.data` was undefined, handler silently failed.
- Also removed `{ teamSize: 2 }` options object — `teamSize` was removed in v10.
- Fix: `async ([job]) => { ... }` — destructure first element.
- Commit: `d0604a2`

**Finding 5 — bundle uploaded to wrong S3 bucket:**
- Worker was uploading the Remotion bundle to `oanim-renders` (our private bucket) and constructing a public URL as `serveUrl`.
- Remotion Lambda loads `serveUrl` via HTTPS (like a browser), so it got AccessDenied.
- Fix: Use `getOrCreateBucket()` + `getAwsClient()` from `@remotion/lambda` to upload to the `remotionlambda-*` bucket where Lambda has access.
- Import fix: `getOrCreateBucket` is from `@remotion/lambda` root, not `/client`.
- Commits: `81b986c`, `4a0bb5d`

**Finding 6 — S3 bucket ACL and public access:**
- Remotion's bucket had `BucketOwnerEnforced` (ACLs disabled), so `ACL: 'public-read'` on PutObject failed.
- Removed per-object ACL from upload code.
- Remotion v4.0.418+ uses bucket policies for public access instead of ACLs.
- Set bucket ownership to `BucketOwnerPreferred` (allows ACLs for Remotion Lambda's internal operations).
- Set public-read bucket policy on `remotionlambda-useast1-19p1q149s1` via AWS CLI.
- Added `s3:PutBucketOwnershipControls`, `s3:PutBucketPublicAccessBlock`, `s3:PutBucketPolicy` to `remotion-lambda-role` IAM policy.
- Commit: `2426773`

**Finding 7 — absolute paths in bundle index.html:**
- `npx remotion bundle` generates `<script src="/bundle.js">` with absolute paths.
- On S3, `/bundle.js` resolves to the bucket root, not the `sites/oanim-render-xxx/` prefix.
- Fix: rewrite `src="/..."` and `href="/..."` to `src="./..."` and `href="./..."` before uploading.
- Commit: `d439ffe`

**Finding 8 — CLI missing output directory:**
- `downloadRenderOutput()` tried to write to `out/HelloWorld.mp4` without creating the `out/` directory.
- Fix: `mkdir -p` the output directory before creating the write stream.
- Commit: `e2f2bb1`

**Result: Cloud render E2E PASS**
```
✔ Cloud render complete
  Output: out/HelloWorld.mp4
  Size: 0.9 MB
  Resolution: 1920x1080
  FPS: 30
  Codec: h264
```

**Commits pushed:**
- `d0604a2` — fix: pg-boss v10 work() handler — destructure job array
- `81b986c` — fix: upload bundle to Remotion's S3 bucket via getOrCreateBucket
- `4a0bb5d` — fix: import getOrCreateBucket from @remotion/lambda root
- `2426773` — fix: remove ACL from S3 uploads, use bucket policy for public access
- `d439ffe` — fix: rewrite absolute paths in bundle index.html to relative
- `e2f2bb1` — fix: create output directory before downloading cloud render

**AWS IAM changes:**
- Added `s3:PutBucketOwnershipControls`, `s3:PutBucketPublicAccessBlock`, `s3:PutBucketPolicy` to remotion-lambda-role
- Set bucket ownership to BucketOwnerPreferred on remotionlambda-useast1-19p1q149s1
- Set public-read bucket policy on remotionlambda-useast1-19p1q149s1

### Summary
- Auth: PASS (after 3 bug fixes)
- API Keys: PASS
- Usage: PASS
- Cloud Rendering: PASS (after 8 findings across 2 sessions — pg-boss v10 migration + S3/IAM/Remotion Lambda integration)
- 15 commits pushed total

---

## Session 7 — 2026-02-23

### OANIM-039: Generic fal.ai proxy + model cost table

**Shared cost table:**
- Created `packages/api/src/lib/costs.ts` and `packages/cli/src/lib/costs.ts`
- ~30 popular fal.ai models (image gen, editing, video, audio, upscale, bg removal)
- `DEFAULT_COST = $0.05` for unknown models
- `getModelCost(model)` helper function

**Generic `/run` endpoint (API):**
- Added `POST /api/v1/media/run` — accepts `{ model, input }`, proxies to any fal.ai model
- Returns `{ url, result, provider, model, estimatedCostUsd }` where `url` is extracted if image model, `null` otherwise
- `result` is always the raw fal.ai response
- No prefix restriction on model names (supports third-party models like `xai/`, `beatoven/`, `mirelo-ai/`)
- Refactored 4 existing endpoints to use `getModelCost()` instead of inline `COST_ESTIMATES`

**CLI provider updates:**
- Added `RunResult` type (url: string | null, result: unknown) to provider types
- Added `run(model, input)` to `MediaProvider` interface
- Implemented in `FalProvider` (direct fal.ai) and `PlatformProvider` (platform proxy)
- Both providers now use shared `getModelCost()` from `lib/costs.ts`

**Gateway + CLI command:**
- Added `run()` to `MediaGateway` with cost limit + credit balance checks
- Added `oanim assets run --model <id> --input <json> [--out <path>]` command
- If `--out` and URL exists: downloads to file. Otherwise: prints raw JSON to stdout (agent-friendly)

---

## Session 8 — 2026-02-23

### Rate Limiting + CLI Usage Commands + Stripe Billing (OANIM-042, OANIM-043, OANIM-045)

**Phase 1 — Rate Limiting (OANIM-043):**
- New `packages/api/src/lib/rate-limit.ts` — in-memory sliding window rate limiter
- Factory function `rateLimit({ windowMs, maxRequests, keyFn })` returns Hono middleware
- Returns 429 with `Retry-After` header when limit exceeded
- Periodic stale-entry cleanup via `setInterval` (60s, unref'd)
- `mediaRateLimit` — 60 req/min, keyed by user ID, applied to `/api/v1/media/*`
- `authRateLimit` — 10 req/min, keyed by client IP (X-Forwarded-For), applied to `/api/v1/auth/cli/*`
- CLI `HttpClient` handles 429 in both `request()` and `uploadBlob()` methods

**Phase 2 — CLI Usage Commands (OANIM-045):**
- New `GET /api/v1/usage/records?limit=50&offset=0&days=30` endpoint — per-record usage detail with pagination
- New `table(headers, rows)` helper in `packages/cli/src/lib/output.ts` — padEnd column alignment with chalk
- New `packages/cli/src/commands/usage.ts`:
  - `oanim usage` — balance + last 7 days summary table (date, cost, requests). Low-balance warning when < $1.
  - `oanim usage history --limit <n> --days <n>` — per-record table (Date, Provider, Model, Operation, Cost) with total

**Phase 3 — Stripe Billing (OANIM-042):**
- New `paymentStatusEnum` + `payments` table in `packages/api/src/db/schema.ts` — id, userId FK, stripeSessionId (unique idx), stripePaymentIntentId, amountUsd, creditsUsd, status, createdAt, completedAt
- Migration generated: `drizzle/0001_cultured_paibok.sql`
- Added `stripe@^17` dependency, added to tsup externals
- New `packages/api/src/routes/billing.ts`:
  - `POST /checkout` (auth) — creates Stripe Checkout Session, inserts pending payment, returns `{ checkoutUrl, sessionId }`
  - `GET /success?session_id&port` — redirects to CLI localhost callback or shows HTML
  - `GET /cancel?port` — same pattern for cancellation
  - `POST /webhook` — verifies Stripe signature, handles `checkout.session.completed` (update payment, add credits) and `checkout.session.expired` (mark failed). Idempotent via status check.
  - `GET /history?limit=20` (auth) — returns `{ payments: [...], totalPurchasedUsd }`
- New `packages/cli/src/commands/billing.ts`:
  - `oanim billing` — balance + 5 most recent purchases table. Low-balance warning.
  - `oanim billing buy --amount <5|20|50>` — local callback server, POST /checkout, open browser, wait for callback (5min timeout), poll balance on success. Without --amount: shows tier list.
- Mounted at `/api/v1/billing` in API index

**Build verified:** `pnpm build` succeeds (all 3 packages)

**New env vars needed for deployment:**
- `STRIPE_SECRET_KEY` — Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

### Follow-up refinements

- Replaced fixed tier system ($5/$20/$50) with free-form dollar amounts ($5 minimum)
- 10% bonus credits on purchases >= $50 (e.g. $100 → $110 credits)
- CLI shows checkout URL with "Send this to your human:" message (agent-friendly)
- Payment methods configured via Stripe Dashboard (cards, Apple Pay, Google Pay, Cash App, Link)

**E2E verified:** Stripe test-mode checkout completes, webhook fires, credits added to balance, `oanim billing` shows purchase history. All three features (rate limiting, usage commands, billing) working end-to-end.

### npm publish (OANIM-026)

- Created `@oanim` org on npmjs.com
- Added `publishConfig`, `repository`, `homepage`, `keywords` to both package.json files
- Published `@oanim/core@0.1.0` (34KB) — animation presets, components, design tokens for Remotion
- Published `oanim@0.1.0` (13KB) — CLI with init, render, assets, login, billing, usage commands
- Users can now: `npx oanim init my-project` and `npm install @oanim/core`

---

## Session 9 — 2026-02-23

### Mintlify documentation site (OANIM-035)

**Scaffold:**
- Created `packages/docs/` with `package.json`, `docs.json` (Mintlify config), logo SVGs, favicon
- Orange branding (#FF8000), two tabs (Documentation + Platform), GitHub topbar link
- Picked up automatically by `packages/*` glob in pnpm-workspace.yaml

**Documentation tab (14 pages):**
- Getting Started: `index.mdx` (intro + card groups), `quickstart.mdx` (full workflow), `examples.mdx` (6 examples)
- CLI: `cli/init.mdx` (scaffold reference), `cli/render.mdx` (render + animate.json), `cli/assets.mdx` (5 asset commands)
- Animation Presets: `core/element-animations.mdx` (8 animations), `core/springs-and-easings.mdx` (7 springs + 5 easings + helpers), `core/transitions.mdx` (14 transitions)
- Components: `core/typography.mdx` (AnimatedCharacters, TypewriterText, CountUp), `core/ui-components.mdx` (8 UI components + layering), `core/design-tokens.mdx` (5 palettes, fonts, spacing)
- Guides: `guides/composition-patterns.mdx` (multi-scene architecture), `guides/agent-skill.mdx` (skill overview)

**Platform tab (7 pages):**
- `platform/overview.mdx` — open-core model, service overview, auth chain
- `platform/authentication.mdx` — browser OAuth + token login + credential resolution
- `platform/api-keys.mdx` — create/list/revoke + CI usage
- `platform/cloud-rendering.mdx` — `oanim render --cloud` workflow
- `platform/credits-and-billing.mdx` — Stripe billing + full cost table (~30 models)
- `platform/usage.mdx` — balance + usage history commands
- `platform/self-hosting.mdx` — docker-compose + env vars + direct provider keys

**Verification:** `pnpm build` passes (docs package has no build step — `echo` only)

**Config fix:** Initial `docs.json` used legacy `mint.json` format (flat navigation arrays, deprecated `topbarLinks`/`footerSocials`). Rewrote to new format with `theme`, recursive `navigation.tabs[].groups` structure, `navbar`/`footer`. Site live at docs.open-animate.com.

---

## Session 10 — 2026-02-23

### Comprehensive documentation audit and fixes (OANIM-035 follow-up)

Ran 4 parallel research agents auditing: CLI commands, core library exports, API/platform features, and all 21 docs pages cross-referenced against source code.

**Critical fixes (14 pages updated):**

- **core/ui-components.mdx** — Fixed Terminal component API: uses `lines: string[]` prop (not children). Added all missing props: SafeArea `mode`, GlowOrb `size`/`drift`/`opacity`, Terminal `title`/`bg`/`textColor`/`fontSize`/`style`, Card `bg`/`borderColor`/`padding`/`borderRadius`/`spring`/`style`, Badge `bg`/`textColor`/`borderColor`/`fontSize`/`spring`/`style`, Grid `cellSize`/`color`/`lineWidth`/`animated`, Vignette `color`. Added Background props table.
- **core/element-animations.mdx** — Fixed default spring values: popIn='bouncy', blurIn='smooth', elasticScale='wobbly', perspectiveRotateIn='smooth' (docs incorrectly said all use 'snappy'). Added "Default springs per animation" reference table. Fixed slideIn distance (30px not 20px).
- **core/springs-and-easings.mdx** — Added spring config values (mass/damping/stiffness) to presets table. Added "Default springs per animation" cross-reference table.
- **core/typography.mdx** — Added missing `style` prop to all 3 components, `cursorChar` prop to TypewriterText.
- **platform/api-keys.mdx** — Fixed key prefix from `oan_` to `anim_`. Added key format section and 10-key limit.
- **platform/self-hosting.mdx** — Added missing env vars: `FAL_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Added Steps component, $5 default credit note, production considerations section.
- **platform/authentication.mdx** — Clarified auth flow with Steps component. Removed legacy `token` field from resolution table. Added `anim_` prefix mention. Added API URL resolution chain.
- **platform/overview.mdx** — Added rate limits table, `anim_` prefix, $5 signup credits, API URL.
- **platform/credits-and-billing.mdx** — Added missing models (flux-realism, sd-v35-medium, aura-flow, kling-v1.5, lora). Added "What happens when credits run out" section. Added `ANIMATE_MAX_USD_PER_RUN` cost controls section.
- **platform/usage.mdx** — Added "How usage is tracked" section explaining per-operation tracking.
- **platform/cloud-rendering.mdx** — Added Steps component for workflow. Added Remotion Lambda mention.
- **cli/render.mdx** — Added CRF explanation note.
- **index.mdx** — Removed redundant `# oanim` heading. Added Platform section with link to platform tab.
- **quickstart.mdx** — Added Steps component for better UX. Added `props` to animate.json description.

**Build verified:** `pnpm build` succeeds. Live site verified at docs.open-animate.com.

---

## Session 11 — 2026-02-23

### Docs reframing: creative suite for agents (OANIM-035 follow-up)

**Naming consistency (16 files):**
- Updated all project/platform references from "oanim" to "Open Animate" across all 16 affected docs pages
- CLI commands (`oanim init`, `oanim render`) and package names (`@oanim/core`) unchanged
- Updated logos (light.svg, dark.svg) from "oanim" to "open animate", widened viewBox
- Updated favicon from "o" to "oa"
- Updated docs.json name from "oanim" to "Open Animate"

**Agent-first reframing (12 files):**
- Rewrote `index.mdx` to match landing page (open-animate.com): "The creative suite for agents." / "Works with Claude Code · Cursor · Codex · Windsurf"
- "What agents can build" cards replace feature inventory (Product Launch, Explainer, Metrics Dashboard, Meme Caption)
- Renamed `examples.mdx` → `templates.mdx` with landing page copy ("Gradient background, logo pop-in, CTA slide. The 5-second clip every startup needs.")
- Restructured nav: merged "Animation Presets" + "Components" groups into single "Reference" group
- Stripped Remotion-centric language from CLI descriptions (init: "Scaffold a new video project", render: "Export your composition to MP4", assets: "Generate and manipulate images with AI")
- Rewrote `guides/agent-skill.mdx` — removed Remotion skills prerequisite framing, focused on capabilities
- Tightened `quickstart.mdx` — "Your agent writes src/MyComp.tsx", next steps link to Templates and Asset Generation
- Switched Mintlify theme from `mint` to `maple`

**Commits:** `77a8c22` (naming), `b267166` (initial agent reframe), `1ab9902` (full reframe), `9a184c3` (maple theme)

### Publish agent skills (OANIM-040)

**SKILL.md frontmatter:**
- Added YAML frontmatter per agentskills.io spec: `name: animate-skill`, description (creative suite for agents positioning), license, metadata (author, version, homepage, docs, repository)
- Rewrote body: removed ASCII art, added Capabilities table covering all CLI commands and @oanim/core features, added template durations

**Claude Code plugin manifest:**
- Created `.claude-plugin/plugin.json` with name, description, author, homepage, repository, license, keywords

**skills.sh verification:**
- `npx skills add jacobcwright/open-animate` — SUCCESS
- Found 1 skill (animate-skill), displayed description correctly
- Detected 41 compatible agents (Claude Code, Codex, Cursor, Windsurf, Gemini CLI, GitHub Copilot, etc.)
- Install targets: Universal `.agents/skills/` (7 agents) + optional individual agent dirs

**ClawHub:**
- `clawhub login` — authenticated as @jacobcwright
- CLI publish rate-limited — published manually via web UI at clawhub.ai/upload
- Live at: https://clawhub.ai/jacobcwright/open-animate
- Install: `clawhub install oanim`

**Claude plugin directory:**
- Submission is via Google Form at `forms.gle/rDSt7kudt7G9MrKB7` — manual submission needed

**Commit:** `2d5423e`, `72dcaa1` (ClawHub live)

### README revamp

Rewrote root README.md to match "creative suite for agents" positioning now that docs, landing page, and npm packages are all live.

**Before:** Library-focused — listed every animation, transition, component inline. Title was "oanim (open-animate)".

**After:**
- Hero: "The open-source creative suite for AI agents" with npm version badges
- Links to open-animate.com, docs.open-animate.com, npmjs.com
- "Works with" line: Claude Code, Cursor, Codex, Windsurf
- Capabilities table (asset gen, video composition, design system, cloud rendering)
- Templates section with landing page copy (replaces exhaustive API lists)
- Agent skill install instructions (`npx skills add` + `clawhub install`)
- Full CLI command table (11 commands including login, billing, usage, api-keys)
- Platform section with $5 free credits, link to docs
- Cut ~45% of content — inline API reference moved to docs site

**Commit:** `74deaae`

---

## Session 11 — 2026-02-23

### OANIM-041: Open Animate Launch Video

Built a 45-second launch video at `examples/oa-launch/` using oanim itself — dogfooding the full component library.

**Structure:** 6 scenes, 5 transitions, 1350 frames @ 30fps (1920x1080)

| Scene | Duration | Components Used |
|-------|----------|----------------|
| TheProblem | 6.5s | Badge, AnimatedCharacters, Background, GlowOrb, SafeArea, Vignette, fadeUp, blurIn |
| TheReveal | 7.5s | AnimatedCharacters, Badge, Background, Grid, GlowOrb, SafeArea, Vignette, fadeUp, blurIn |
| TheDemo | 9.5s | Terminal, Background, GlowOrb, SafeArea, Vignette, fadeUp |
| TheCapabilities | 8.5s | Card, CountUp, Background, GlowOrb, SafeArea, Vignette, fadeUp |
| TheStack | 7.5s | Badge, AnimatedCharacters, Background, GlowOrb, SafeArea, Vignette, fadeUp, blurIn |
| TheCTA | 10.2s | AnimatedCharacters, TypewriterText, Background, Grid, GlowOrb, SafeArea, Vignette, fadeUp, popIn |

**Transitions:** wipe(left) → scaleFade → morphExpand → clipCircle → fadeBlur

**Component coverage:**
- UI Components: 8/8 (Background, GlowOrb, SafeArea, Terminal, Card, Badge, Grid, Vignette)
- Typography: 3/3 (AnimatedCharacters, TypewriterText, CountUp)
- Element animations: 3/8 (fadeUp, blurIn, popIn)
- Transitions: 5/14 (wipe, scaleFade, morphExpand, clipCircle, fadeBlur)

**Palette:** `palettes.sunset` (orange #f97316, amber #f59e0b, warm dark #0c0a09)

**Verification:**
- `pnpm build` passes at workspace root
- `npx remotion studio` opens — all 6 scenes render without errors
- All transitions smooth between scenes
- Terminal typing, CountUp, TypewriterText all animate correctly
- "This video was made with oanim." readable in final scene

---

## Session 12 — 2026-02-23

### OANIM-046: Media how-to documentation + OANIM-047: Launch video rebuild

**Part 1 — Media documentation (OANIM-046):**

New files:
- `packages/docs/guides/media.mdx` — Centerpiece "Working with Media" guide covering the 3-step Generate → Place → Use pattern for images (`<Img>`), video (`<OffthreadVideo>`), and audio (`<Audio>`). Includes layer order, volume animation, and complete combined example.
- `skills/open-animate/references/media-guide.md` — Agent-optimized version with concise code snippets, video model table, and layer order quick reference.

Updated files (8):
- `packages/docs/docs.json` — Added `guides/media` as first item in Guides group
- `skills/open-animate/SKILL.md` — Added AI video/audio generation and media compositing to capabilities table, expanded step 5 with gen+use code, added media-guide.md to references
- `skills/open-animate/references/workflow.md` — Inserted new step 6 "Add generated media assets" with gen commands + Remotion usage code (steps renumbered 6→11)
- `skills/open-animate/references/asset-generation.md` — Added video/audio gen commands + "Using generated assets in compositions" section with Img/OffthreadVideo/Audio code
- `skills/open-animate/references/composition-patterns.md` — Added "Media layers" section: video bg, image bg, global audio track patterns with full layer order
- `packages/docs/guides/composition-patterns.mdx` — Added matching media layers section with link to media guide
- `packages/docs/quickstart.mdx` — Expanded asset step to show Img usage code + link to media guide, changed card link from Asset Generation to Working with Media
- `README.md` — Updated Video Composition capability to mention `<Img>`, `<OffthreadVideo>`, `<Audio>`, added oa-launch to templates table

**Part 2 — Launch video rebuild (OANIM-047):**

Rebuilt `examples/oa-launch/` — 829 frames (~28s) down from 1350 frames (45s):

| Scene | Duration | What's new |
|-------|----------|-----------|
| TheProblem | 4s (120f) | Tighter timing — delays compressed, faster stagger |
| TheReveal | 5s (150f) | AI-generated `<Img>` full-bleed background + dark overlay |
| ThePower (NEW) | 5.5s (165f) | AI-generated `<OffthreadVideo>` background + "Generate. Compose. Render." |
| TheDemo | 5.5s (165f) | Terminal shows asset gen + render workflow (not just init) |
| TheStack | 4.5s (135f) | Faster badge entrances (0.18s stagger vs 0.25s) |
| TheCTA | 6s (180f) | Updated closing: "images, video, and audio all generated by AI" |

Changes:
- `Root.tsx` — durationInFrames: 1350 → 829
- `OALaunch.tsx` — Added `<Audio>` for global bg music, replaced TheCapabilities with ThePower, faster transitions (15-20f vs 25-30f)
- `ThePower.tsx` — NEW scene with `<OffthreadVideo>` background
- `TheCapabilities.tsx` — DELETED (replaced by ThePower)
- All 5 remaining scenes rewritten with compressed timing

Assets generated:
- `public/bg-gradient.png` — via `oanim assets gen-image` (succeeded)
- `public/abstract-clip.mp4` — via `oanim assets run` (minimax-video model)
- `public/bg-music.mp3` — via `oanim assets run` (stable-audio model)

Frame math: (120+150+165+165+135+180) − (18+15+18+15+20) = 915 − 86 = 829

**Build verified:** `pnpm build` passes

---

## Session 13 — 2026-02-23

### Queue-based media API fix (OANIM-048)

Fixed the 504 Gateway Timeout issue for slow-running fal.ai models (video, audio).

**Root cause:** nginx reverse proxy on Porter has ~60s timeout. Video models (kling-video: 2-5min) and audio (stable-audio: 1-2min) exceeded this.

**Solution:** Queue-based submit+poll pattern:
- API: `POST /submit` queues job to fal.ai, returns requestId + fal.ai-provided status/response URLs
- API: `GET /status/:requestId` polls fal.ai queue, returns result when COMPLETED
- CLI: `PlatformProvider.submitAndPoll()` with exponential backoff (2s initial → 10s max, 10min timeout)
- Falls back to synchronous `/run` if `/submit` returns 404 (backward compat)

**Key bug found:** fal.ai queue URLs use a different path than the model identifier — e.g., model `fal-ai/flux/schnell` uses queue path `fal-ai/flux` (variant stripped). Fixed by using the `status_url` and `response_url` returned in fal.ai's submit response instead of constructing URLs manually.

**Other fixes along the way:**
- Removed `Content-Type: application/json` from GET requests (caused 405 on fal.ai)
- Queue result endpoint wraps output in `response` key (handled with `data.response ?? data`)
- Added try/catch error handling to `/status` endpoint for better error surfacing

Files changed:
- `packages/api/src/routes/media.ts` — Added `falAuthHeader()`, `falQueueSubmit/Status/Result()`, `POST /submit`, `GET /status/:requestId`
- `packages/cli/src/lib/providers/platform.ts` — Added `submitAndPoll()` with polling, `PlatformSubmitResponse`/`PlatformStatusResponse` interfaces
- `packages/cli/src/lib/providers/fal.ts` — Renamed `getImageUrl` → `getMediaUrl` (handles video.url, audio_file.url)

**Verified:** All 3 asset types generate successfully through the CLI:
- `oanim assets run --model fal-ai/flux/schnell` → image (fast, ~2s)
- `oanim assets run --model fal-ai/kling-video/v1/standard/text-to-video` → video (queued, ~3min)
- `oanim assets run --model fal-ai/stable-audio` → audio (queued, ~1min)

### Launch video assets finalized

Generated the missing video asset (`abstract-clip.mp4`) via kling-video now that the queue API works. All 3 AI-generated assets verified in `examples/oa-launch/public/`:
- `bg-gradient.png` (52KB) — warm gradient for TheReveal background
- `abstract-clip.mp4` (2.9MB) — flowing liquid shapes for ThePower background
- `bg-music.mp3` (5.0MB) — ambient electronic for global audio track

Verified in Remotion Studio: all 6 scenes render, video plays as background, audio visible in timeline, duration 00:27.19 (829 frames).

---

## Session 14 — 2026-02-24

### Fix CLI login OAuth redirect (OANIM-049)

**Problem:** `oanim login` opened the browser, user signed in via GitHub OAuth, but Clerk redirected to `oanim.dev` instead of back to `api.oanim.dev/api/v1/auth/cli/callback`. The CLI hung indefinitely waiting for the localhost callback. Running `oanim login` a second time worked because the Clerk session was already established.

**Root cause:** Clerk's `mountSignIn()` widget controls the OAuth redirect chain server-side. The `forceRedirectUrl` and `signInForceRedirectUrl` options (both component-level and `Clerk.load()`-level) were all ignored for OAuth flows because `api.oanim.dev` wasn't in Clerk's allowed redirect domains.

**Solution:** Replaced `mountSignIn()` with Clerk's lower-level `authenticateWithRedirect()` API:
- Custom OAuth buttons (GitHub, Google) + email/password form
- `authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })` with both URLs pointing back to the same login page
- On return from OAuth, `handleRedirectCallback()` completes verification
- Existing "already signed in" logic then fires `redirectWithToken()`
- Guarded `handleRedirectCallback()` to only fire when `__clerk` params present in URL (prevents redirect to Clerk's hosted sign-in on fresh page loads)

**Commits:** `fe4c3b6`, `257fde0`, `f681a4b`, `1d39bb0`

### Login page branding + browser sign-out (OANIM-050)

**Login page branding:**
- Space Grotesk font (matching oanim.dev landing page)
- "open animate" logo text above sign-in card
- Dark card container with subtle border (`#0a0a0a` on `#000`)
- Orange gradient "Continue" button (`#ff8700 → #ffb347 → #ff8700`)
- Orange focus ring on input fields
- Title: "Open Animate — Sign In"

**Browser sign-out on logout:**
- New endpoint: `GET /api/v1/auth/cli/logout` — serves page that loads Clerk and calls `Clerk.signOut()`
- Updated `oanim logout` to open this page in the browser after clearing local credentials
- Prevents stale Clerk sessions from auto-completing on next `oanim login`
- Re-linked CLI globally via `npm link` (previous `pnpm link` had created a copy, not a symlink)

**Commit:** `b7a92c0`

### Launch (OANIM-051)

- Announced Open Animate on LinkedIn and X
- Landing page live at oanim.dev
- Docs live at docs.open-animate.com
- npm packages published: `@oanim/core@0.1.0`, `oanim@0.1.0`
- Agent skill installable via `npx skills add jacobcwright/open-animate`
- ClawHub listing at clawhub.ai/jacobcwright/open-animate

### Branded success page + splash SVG

- Updated CLI localhost callback success page (`packages/cli/src/commands/login.ts`) with matching branding: Space Grotesk font, dark card, orange gradient checkmark, "open animate" logo
- Updated `.github/splash.svg` (README hero image) from purple/indigo color scheme to orange brand identity: `#ff8700`/`#ffb347` gradient on title text, accent line, and pill badges; pure black background; Space Grotesk font

**Commits:** `7998bcc` (success page), `a246fa9` (splash SVG)

---

## Session 15 — 2026-02-26

### @oanim/console dashboard (OANIM-052)

Built a full dashboard web app at `packages/console/` for oanim users.

**Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Clerk auth, shadcn/ui (new-york), Recharts, Sonner

**Design system:** Exact match of Castari design tokens — dark theme, 0px border radius, CSS variables (`--background: #0D0D0F`, `--surface: #1A1A1F`, `--border: #27272A`, `--chart-1: #8B5CF6`), bg-grid pattern, typography (Instrument Serif headings, Inter body, Geist Mono code).

**Pages (7):**
- `/dashboard` — Overview: 3 stat cards (balance, 7d spend, API calls), quick actions, getting started guide
- `/dashboard/usage` — Time range selector (7d/30d/90d), daily cost bar chart, recent API calls table
- `/dashboard/billing` — Balance card, 5 credit tiers via Stripe checkout, payment history
- `/dashboard/api-keys` — Create/delete keys, show-once secret dialog, keys table
- `/dashboard/templates` — 6 template cards with GitHub links and CLI usage
- `/dashboard/renders` — Cloud render history (placeholder)
- `/dashboard/settings` — Account info from Clerk

**Infrastructure:**
- Clerk middleware protecting all routes except /sign-in and /sign-up
- Type-safe API client (`lib/api.ts`) for all oanim API endpoints
- Collapsible sidebar with context provider
- 10 UI components (Button, Card, Badge, Table, Input, Skeleton, Sonner, Dialog, Sidebar, DashboardContent)

**Test suite (30 tests, all passing):**
- `tests/utils.test.ts` — cn(), formatCurrency(), formatDate(), formatRelativeTime()
- `tests/api.test.ts` — API client functions, error handling, ApiError class
- `tests/components.test.tsx` — Button, Card, Badge, Input, Skeleton rendering + variants

**Build:** `next build` succeeds (10 routes), `vitest run` 30/30 pass

**PR:** #3 on `feat/console` branch — 41 files, +5155 lines

---

## Session 16 — 2026-02-26

### Cowork Plugin + MCP Endpoint (OANIM-053)

Added MCP endpoint to the existing API and packaged the repo as a Cowork plugin.

**Problem:** The open-animate skill works in Claude Code (terminal) but not in Cowork — the sandbox blocks outbound HTTP. CLI asset generation commands fail.

**Solution:** MCP endpoint on the existing API at `api.oanim.dev/mcp` + `.mcp.json` plugin config + slash commands.

**Step 1 — Extract fal.ai helpers:**
- New `packages/api/src/lib/fal.ts` — extracted all fal.ai helpers (types, auth, request functions, usage tracking) from `media.ts`
- Added `submitAndPoll(model, input, userId)` — combines queue submit + exponential backoff polling (2s initial, 10s max, 1.5x multiplier, 10min timeout) + result fetch
- Updated `packages/api/src/routes/media.ts` to import from `../lib/fal.js`

**Step 2 — MCP SDK + server:**
- Added `@modelcontextprotocol/sdk` + `zod` dependencies
- New `packages/api/src/mcp/server.ts` — `createMcpServer(user)` factory that creates a stateless McpServer with 7 tools:
  - `gen_image` — text-to-image (sync via `falRequest`)
  - `edit_image` — image editing (sync)
  - `remove_bg` — background removal (sync)
  - `upscale` — image upscaling (sync)
  - `gen_video` — text-to-video (async via `submitAndPoll`)
  - `gen_audio` — text-to-audio (async via `submitAndPoll`)
  - `run_model` — any fal.ai model (sync or async)
- All tools track usage and deduct credits via shared helpers

**Step 3 — MCP HTTP handler:**
- New `packages/api/src/mcp/handler.ts` — raw Node.js HTTP handler for `/mcp`
  - Authenticates via `Authorization: Bearer <ANIMATE_API_KEY>`
  - Creates fresh stateless McpServer per request
  - Uses `StreamableHTTPServerTransport` (stateless, no sessions)
  - Handles body parsing, auth errors, cleanup
- Updated `packages/api/src/index.ts` — intercepts `/mcp` at Node HTTP level via `createServer` + `getRequestListener`, delegates all other routes to Hono

**Step 4 — Plugin config:**
- New `.mcp.json` — points to `https://api.oanim.dev/mcp` with `ANIMATE_API_KEY` auth
- New `commands/animate.md` — `/animate` slash command (full video creation workflow)
- New `commands/gen-image.md` — `/gen-image` slash command (quick image gen)
- New `commands/render.md` — `/render` slash command (render project)

**Step 5 — Skill updates:**
- Updated `SKILL.md` — added MCP tools table alongside CLI commands, 3-column capabilities table (Capability, MCP Tool, CLI Command)
- Updated `references/asset-generation.md` — MCP tool examples above each CLI section
- Updated `references/workflow.md` — MCP tools as primary method in step 6
- Updated `references/media-guide.md` — MCP tool examples for all media types

**Step 6 — Documentation:**
- New `CONNECTORS.md` — full parameter documentation for all 7 MCP tools
- Updated `README.md` — added Cowork Plugin section with MCP tools table and slash commands

**Build verified:** `pnpm build` succeeds (all packages including console)

---

## Session 8 — 2026-02-26

### Upgrade model catalog to latest fal.ai models (PR #6)

Researched fal.ai's current model gallery and replaced outdated models with best-in-class options across all 6 categories. Updated 18 files across the entire codebase.

**New model lineup:**
- **Image Gen (5):** Flux Schnell (fast/cheap), Flux 2 Flex (mid-tier, best typography), Recraft V4 (design), Ideogram V3 (typography tiers), Nano Banana 2 (Google Gemini 3.1 Flash, premium)
- **Image Edit (3):** Flux Kontext Pro (best editing, character consistency), Nano Banana 2 Edit, Reve Edit
- **BG Removal (2):** BiRefNet (kept, cheap), BRIA RMBG 2.0 (licensed data, pro)
- **Upscale (2):** BRIA Creative, Topaz Upscale (industry standard)
- **Video (5):** MiniMax Hailuo-02 (budget), Kling 2.5 Turbo Pro (mid), Kling V3 Pro (cinematic + audio), Veo 3.1 (Google, 4K + audio), Sora 2 Pro (OpenAI, 25s + audio)
- **Audio (3):** Beatoven Music, Beatoven SFX, MiniMax Speech-02 HD

**Removed deprecated models:** Flux Dev/Pro v1.1/Ultra, Flux Realism, SD 3.5, AuraFlow, Flux img2img/fill/inpainting, rembg, Creative/Clarity Upscaler, Kling v1/v1.5, Minimax video-01-live, Hunyuan Video, Luma Dream Machine, Runway Gen-3, Veo 2, Stable Audio

**Default model changes:**
- Image gen: `fal-ai/flux/schnell` → `fal-ai/flux-2-flex`
- Image edit: `fal-ai/flux/dev/image-to-image` → `fal-ai/flux-pro/kontext`
- Upscale: `fal-ai/creative-upscaler` → `fal-ai/bria/upscale/creative`
- Video: `fal-ai/kling-video/v1/standard/text-to-video` → `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`
- Audio: `fal-ai/stable-audio` → `beatoven/music-generation`

**Files updated (18):**
- `packages/console/lib/models.ts` — model catalog with pricing
- `packages/cli/src/lib/costs.ts` + `packages/api/src/lib/costs.ts` — cost entries
- `packages/api/src/routes/media.ts` — API route defaults
- `packages/api/src/mcp/server.ts` — MCP tool defaults
- `packages/cli/src/lib/providers/fal.ts` — CLI provider defaults
- `packages/cli/src/commands/assets.ts` — help text defaults
- `skills/open-animate/SKILL.md`, `references/workflow.md`, `references/media-guide.md`, `references/asset-generation.md` — agent skill docs
- `packages/docs/cli/assets.mdx`, `packages/docs/platform/credits-and-billing.mdx`, `packages/docs/guides/media.mdx` — Mintlify docs
- 4 test files updated to match new model IDs
- `CONNECTORS.md` — MCP tool parameter defaults

**Bug fixes (PR review):**
- Console AudioTab: replaced hardcoded "Free" badge/label with dynamic `formatModelCost(model.cost)` — now correctly shows $0.070
- Console AudioTab: changed `seconds_total` → `duration_in_seconds` parameter name for Beatoven model compatibility

**Build verified:** `pnpm build` succeeds, 202/202 CLI + console tests pass

---

## Session — 2026-03-16

### Agent page for console (PR #7)

**New `/agent` route:**
- Created `packages/console/app/agent/page.tsx` — server-rendered page (zero client JS) at `oanim.dev/agent`
- Contains full markdown representation of the site: quickstart guide (5-step scaffold→render workflow with code examples), capabilities, templates catalog, llms.txt docs index, and footer links
- Uses JetBrains Mono, pure black bg, neutral color palette matching console dark theme
- Human/Agent toggle at top links back to `/`

**Hidden agent hint:**
- Added `<div hidden data-agent-hint>` to root layout (`app/layout.tsx`) directing AI agents to `/agent`
- Present on every page so agents parsing any route discover the machine-readable version

**Auth middleware:**
- Added `/agent(.*)` and `/` to public routes in `middleware.ts` so the agent page and home are accessible without Clerk auth
