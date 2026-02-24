---
name: open-animate
description: Open Animate — the creative suite for AI agents. Create professional motion graphics, generate images, and render MP4 videos. Use when the user wants to make videos, animations, motion graphics, social clips, product launches, explainers, or any visual content. Supports asset generation (images, backgrounds, upscaling) and video composition with animation presets, transitions, and components.
license: Apache-2.0
compatibility: Requires Node.js 18+
metadata:
  author: jacobcwright
  version: "1.0.0"
  homepage: https://open-animate.com
  docs: https://docs.open-animate.com
  repository: https://github.com/jacobcwright/open-animate
---

# Open Animate — Creative Suite for Agents

Create professional motion graphics and generate visual assets. Describe what you want. Get an MP4.

## Prerequisites

This skill builds on **Remotion skills** for core Remotion API patterns:
```bash
npx skills add remotion-dev/skills
```

## Workflow

### 1. Initialize project
```bash
npx oanim init my-video
cd my-video
```

### 2. Compose using `@oanim/core`
```tsx
import { fadeUp, popIn, Background, SafeArea, palettes } from '@oanim/core';
```

See `references/animation-cookbook.md` for the full presets reference.

### 3. Preview
```bash
npx remotion studio
```

### 4. Render to MP4
```bash
npx oanim render
```

### 5. Generate assets (optional)
```bash
npx oanim assets gen-image --prompt "dark gradient abstract" --out public/bg.png
```

## Capabilities

| Capability | Tool |
|------------|------|
| Project scaffolding | `oanim init` |
| Animation presets (fadeUp, popIn, springs) | `@oanim/core` |
| Components (Terminal, Card, Badge, GlowOrb) | `@oanim/core` |
| Scene transitions (fadeBlur, clipCircle, wipe) | `@oanim/core` |
| Typography (AnimatedCharacters, TypewriterText, CountUp) | `@oanim/core` |
| Design tokens (5 palettes, fonts, spacing) | `@oanim/core` |
| Rendering to video | `oanim render` |
| Cloud rendering | `oanim render --cloud` |
| AI image generation | `oanim assets gen-image` |
| Image editing | `oanim assets edit-image` |
| Background removal | `oanim assets remove-bg` |
| Image upscaling | `oanim assets upscale` |
| Any fal.ai model | `oanim assets run` |

## References

- `references/workflow.md` — Step-by-step agent workflow
- `references/scene-config.md` — animate.json schema reference
- `references/composition-patterns.md` — Multi-scene composition architecture
- `references/animation-cookbook.md` — Full `@oanim/core` presets reference
- `references/asset-generation.md` — AI asset generation guide

## Templates

- `templates/launch-video.md` — 4-scene product launch (5s)
- `templates/explainer.md` — Step-based explainer video (20s)
- `templates/logo-reveal.md` — Logo animation with glow (5s)
- `templates/meme-caption.md` — Vertical social clip (6s)
- `templates/investor-update.md` — Metrics dashboard (15s)
