# oanim (open-animate)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

CLI + component library for creating premium motion graphics with [Remotion](https://www.remotion.dev/).

oanim gives you production-ready animation presets, transitions, and UI components so you can go from idea to rendered video in minutes — not hours.

## Quickstart

```bash
# Install the CLI
npx oanim init my-video

# Preview in browser
cd my-video && npx remotion studio

# Render to MP4
npx oanim render
```

## Architecture

```
oanim/
├── packages/
│   ├── core/       @oanim/core — animation presets + components
│   └── cli/        oanim CLI (init, render, assets)
├── animate-skill/ Agent skill (SKILL.md + references + templates)
└── examples/       6 working Remotion projects
```

### How it works

```
oanim init → scaffold Remotion project with @oanim/core
         → compose scenes using presets + components
         → npx remotion studio (preview)
         → oanim render (export MP4)
         → oanim assets (AI image generation via fal.ai)
```

## @oanim/core

### Animation Presets

Element animations that return `CSSProperties` — drop them on any div:

```tsx
import { fadeUp, popIn, blurIn } from '@oanim/core';

<div style={fadeUp({ frame, fps, delay: 0.3 })}>Fades up</div>
<div style={popIn({ frame, fps, spring: 'bouncy' })}>Pops in</div>
```

**Available:** `fadeUp`, `fadeDown`, `slideInLeft`, `slideInRight`, `popIn`, `blurIn`, `elasticScale`, `perspectiveRotateIn`

### Transitions

14 transition presets for `@remotion/transitions` TransitionSeries:

```tsx
import { fadeBlur, wipe, scaleFade } from '@oanim/core';

<TransitionSeries.Transition
  presentation={wipe({ direction: 'left' })}
  timing={springTiming({ config: { damping: 200 }, durationInFrames: 30 })}
/>
```

**Available:** `fadeBlur`, `scaleFade`, `clipCircle`, `clipPolygon`, `wipe`, `splitHorizontal`, `splitVertical`, `perspectiveFlip`, `morphExpand`, `zoomThrough`, `pushLeft`, `pushRight`, `slideLeft`, `slideRight`

### Typography Components

| Component | Description |
|---|---|
| `AnimatedCharacters` | Staggered per-character spring entrance |
| `TypewriterText` | Character-by-character reveal with cursor |
| `CountUp` | Animated number counter with prefix/suffix |

### UI Components

| Component | Description |
|---|---|
| `SafeArea` | Title-safe padding container |
| `Background` | Gradient/solid backgrounds |
| `GlowOrb` | Animated glowing orb |
| `Terminal` | Typewriter terminal window |
| `Card` | Glassmorphism card with spring entrance |
| `Badge` | Pill-shaped label |
| `Grid` | Subtle background grid |
| `Vignette` | Edge darkening overlay |

### Design Tokens

5 color palettes (`dark`, `light`, `midnight`, `sunset`, `ocean`), font stacks, and a spacing scale:

```tsx
import { palettes, fonts, spacing } from '@oanim/core';
const colors = palettes.midnight;
```

## CLI Commands

| Command | Description |
|---|---|
| `oanim init [name]` | Scaffold a Remotion project with @oanim/core |
| `oanim render` | Render composition using animate.json config |
| `oanim assets gen-image` | Generate image from text prompt (fal.ai) |
| `oanim assets edit-image` | Edit image with text prompt (fal.ai) |
| `oanim assets remove-bg` | Remove image background (fal.ai) |
| `oanim assets upscale` | 2x upscale image (fal.ai) |

Asset commands require `ANIMATE_FAL_KEY` env var. Get a key at [fal.ai](https://fal.ai/dashboard/keys).

## Agent Skill

The `animate-skill/` directory contains an agent skill that teaches AI agents how to compose motion graphics using oanim. It includes workflow rules, composition patterns, an animation cookbook, and example references.

See [`animate-skill/SKILL.md`](animate-skill/SKILL.md) for details.

## Examples

| Example | Description | Duration | Resolution |
|---|---|---|---|
| [hello-world](examples/hello-world) | Minimal animated text | 5s | 1920x1080 |
| [launch-video](examples/launch-video) | 4-scene product launch | 15s | 1920x1080 |
| [logo-reveal](examples/logo-reveal) | Logo pop-in with glow | 5s | 1920x1080 |
| [meme-caption](examples/meme-caption) | Vertical social clip | 6s | 1080x1920 |
| [explainer](examples/explainer) | 4-scene step-by-step | 20s | 1920x1080 |
| [investor-update](examples/investor-update) | Metrics with CountUp | 15s | 1920x1080 |

Run any example:

```bash
cd examples/hello-world
npx remotion studio   # preview
oanim render          # export MP4
```

## Development

```bash
pnpm install          # install workspace deps
pnpm build            # build core + cli
```

## Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

## License

[Apache 2.0](LICENSE)
