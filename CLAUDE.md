# CLAUDE.md — oanim (open-animate)

## Rules

1. **Use subagents for research.** When looking up Remotion APIs, fal.ai docs, or any external reference, spawn a subagent (Explore or general-purpose) instead of doing inline research. Keep the main context focused on implementation.

2. **Update progress.md and prd.json after each task.** When completing work:
   - Append a dated entry to `progress.md` describing what was done
   - Update the relevant ticket(s) in `prd.json` — set `status` to `"done"`, add notes if needed
   - Add new tickets to `prd.json` for any follow-up work discovered

3. **Build before committing.** Always run `pnpm build` and verify it succeeds before committing. The core package must produce valid DTS output (no TypeScript errors in declaration generation).

4. **Remotion type constraints.** `TransitionPresentation<T>` requires `T extends Record<string, unknown>`. Any props interfaces for transitions must use `extends Record<string, unknown>`. This was a real build failure — don't repeat it.

5. **Test against real Remotion.** When adding or modifying @oanim/core components, verify they work in at least one example project (`examples/hello-world` or `examples/launch-video`) by checking `npx remotion studio` opens.

6. **Keep the CLI thin.** The `oanim` CLI wraps Remotion's own tooling — it does not reimplement rendering. `oanim render` shells to `npx remotion render` with config from `scene.json`.

7. **No JSX in .ts files.** Remotion components use React.createElement() in `.ts` files or JSX in `.tsx` files. The core package uses `React.createElement()` throughout for maximum compatibility. Keep this consistent.

8. **Workspace topology matters.** Both `packages/*` and `examples/*` are in the pnpm workspace. Examples reference `@oanim/core` as `workspace:*`. This means `pnpm install` at root links them automatically.

## What is oanim

Open-source CLI + component library + agent skill for creating React motion graphics via Remotion and exporting MP4.

**Key architecture:** Remotion skills teach the agent *how to write Remotion code*. oanim teaches the agent *how to compose premium motion graphics quickly* via a presets library, shared components, and a workflow CLI.

## Repo Layout

```
open-animate/
  packages/
    core/       # @oanim/core — animation presets + components for Remotion
    cli/        # oanim CLI (bin: oanim)
  skill/        # Agent skill (SKILL.md + rules + examples)
  examples/     # Working example Remotion projects
  progress.md   # Append-only session log
  prd.json      # Ticket tracker (title, description, requirements, tests, status)
```

## Build & Dev

```bash
pnpm install              # install all workspace deps
pnpm build                # build core + cli
```

### Link CLI globally for testing
```bash
cd packages/cli && pnpm link --global
```

### Run examples
```bash
cd examples/hello-world
npx remotion studio       # preview in browser
oanim render              # render to MP4
```

## Key Conventions

- pnpm workspace (packages/* + examples/*)
- tsup for bundling (ESM + CJS for core, ESM-only for CLI)
- TypeScript strict mode, ES2022 target
- React 19 + Remotion 4 peer deps
- Apache 2.0 license
- GitHub repo: `jacobcwright/open-animate`

## Package Details

### @oanim/core
- Animation presets: springs, easings, element animations (fadeUp, popIn, etc.)
- Transition presets for `@remotion/transitions` TransitionSeries
- Typography components: AnimatedCharacters, TypewriterText, CountUp
- UI components: SafeArea, Background, GlowOrb, Terminal, Card, Badge, Grid, Vignette
- Design tokens: color palettes, font stacks, spacing scale

### oanim CLI
- `oanim init [name]` — scaffold Remotion project with @oanim/core
- `oanim render` — render using scene.json config
- `oanim assets` — AI asset generation via fal.ai (gen-image, edit-image, remove-bg, upscale)
