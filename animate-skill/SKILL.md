```
             ██████  ██████  ███████ ███    ██
            ██    ██ ██   ██ ██      ████   ██
            ██    ██ ██████  █████   ██ ██  ██
            ██    ██ ██      ██      ██  ██ ██
             ██████  ██      ███████ ██   ████
 █████  ███    ██ ██ ███    ███  █████  ████████ ███████
██   ██ ████   ██ ██ ████  ████ ██   ██    ██    ██
███████ ██ ██  ██ ██ ██ ████ ██ ███████    ██    █████
██   ██ ██  ██ ██ ██ ██  ██  ██ ██   ██    ██    ██
██   ██ ██   ████ ██ ██      ██ ██   ██    ██    ███████
```

# oanim — Motion Graphics Agent Skill

Create professional React motion graphics using Remotion + `@oanim/core` animation presets.

## Prerequisites

This skill requires **Remotion skills** for core Remotion API patterns:
```bash
npx skills add remotion-dev/skills
```

oanim builds ON TOP of Remotion skills — it adds premium animation presets, components, and a workflow CLI.

## Workflow

### 1. Initialize project
```bash
oanim init my-video
cd my-video
```

This scaffolds a Remotion project with `@oanim/core` pre-configured.

### 2. Write compositions using `@oanim/core`

Use the animation presets for fast, premium results:
```tsx
import { fadeUp, popIn, Background, SafeArea, palettes } from '@oanim/core';
```

See `references/animation-cookbook.md` for the full presets reference.

### 3. Preview in Remotion Studio
```bash
npx remotion studio
```

### 4. Render to MP4
```bash
oanim render --out out/video.mp4
```

### 5. Generate assets (optional)
```bash
oanim assets gen-image --prompt "dark gradient abstract" --out public/bg.png
```

## When to use what

| Need | Use |
|------|-----|
| Core Remotion API (interpolate, spring, Sequence) | Remotion skills |
| Animation presets (fadeUp, popIn, springs) | `@oanim/core` |
| Ready-made components (Terminal, Card, Badge) | `@oanim/core` |
| Scene transitions (fadeBlur, clipCircle) | `@oanim/core` + `@remotion/transitions` |
| Project scaffolding | `oanim init` |
| Rendering to video | `oanim render` |
| AI asset generation | `oanim assets` |

## References

- `references/workflow.md` — Step-by-step agent workflow
- `references/scene-config.md` — animate.json schema reference
- `references/composition-patterns.md` — Multi-scene composition architecture
- `references/animation-cookbook.md` — Full `@oanim/core` presets reference
- `references/asset-generation.md` — fal.ai integration guide

## Templates

- `templates/launch-video.md` — Full 4-scene product launch
- `templates/explainer.md` — Step-based explainer video
- `templates/logo-reveal.md` — Logo animation
- `templates/meme-caption.md` — Quick social clip
- `templates/investor-update.md` — Metrics + charts
