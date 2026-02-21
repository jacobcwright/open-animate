# CLAUDE.md — oanim

## What is oanim

Open-source CLI + component library + agent skill for creating React motion graphics via Remotion and exporting MP4.

**Key architecture:** Remotion skills teach the agent *how to write Remotion code*. oanim teaches the agent *how to compose premium motion graphics quickly* via a presets library, shared components, and a workflow CLI.

## Repo Layout

```
oanim/
  packages/
    core/       # @oanim/core — animation presets + components for Remotion
    cli/        # oanim CLI (bin: oanim)
  skill/        # Agent skill (SKILL.md + rules + examples)
  examples/     # Working example projects
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
