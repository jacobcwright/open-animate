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
