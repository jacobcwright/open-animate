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
