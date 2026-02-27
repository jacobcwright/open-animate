---
name: open-animate
description: Open Animate — the creative suite for AI agents. Create professional motion graphics, generate images, and render MP4 videos. Use when the user wants to make videos, animations, motion graphics, social clips, product launches, explainers, or any visual content. Supports asset generation (images, backgrounds, upscaling) and video composition with animation presets, transitions, and components.
license: Apache-2.0
metadata:
  openclaw:
    emoji: "\U0001F3AC"
    homepage: https://open-animate.com
    requires:
      bins:
        - npx
    install:
      - kind: node
        package: oanim
        bins:
          - oanim
        label: "Install oanim CLI (npm)"
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

### 5. Generate and use media assets (optional)

**MCP tools** (preferred — works in Cowork and any MCP-enabled environment):

| Tool | Use |
|------|-----|
| `gen_image` | Generate images from text prompts |
| `edit_image` | Edit existing images with prompts |
| `remove_bg` | Remove background from an image |
| `upscale` | Upscale image 2x |
| `gen_video` | Generate video from text (async, polls until done) |
| `gen_audio` | Generate audio/music from text (async, polls until done) |
| `run_model` | Run any fal.ai model with custom input |

**CLI** (fallback — requires outbound HTTP):
```bash
npx oanim assets gen-image --prompt "dark gradient abstract" --out public/bg.png
npx oanim assets run --model fal-ai/kling-video/v2.5-turbo/pro/text-to-video \
  --input '{"prompt":"cinematic abstract motion","duration":"5"}' --out public/clip.mp4
npx oanim assets run --model beatoven/music-generation \
  --input '{"prompt":"ambient electronic, no vocals","duration_in_seconds":30}' --out public/music.mp3
```

Then use in your composition:
```tsx
import { Img, OffthreadVideo, Audio, staticFile } from 'remotion';

<Img src={staticFile('bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
<OffthreadVideo src={staticFile('clip.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
<Audio src={staticFile('music.mp3')} volume={0.25} />
```

## Capabilities

| Capability | MCP Tool | CLI Command |
|------------|----------|-------------|
| Project scaffolding | — | `oanim init` |
| Animation presets (fadeUp, popIn, springs) | — | `@oanim/core` |
| Components (Terminal, Card, Badge, GlowOrb) | — | `@oanim/core` |
| Scene transitions (fadeBlur, clipCircle, wipe) | — | `@oanim/core` |
| Typography (AnimatedCharacters, TypewriterText, CountUp) | — | `@oanim/core` |
| Design tokens (5 palettes, fonts, spacing) | — | `@oanim/core` |
| Rendering to video | — | `oanim render` |
| Cloud rendering | — | `oanim render --cloud` |
| AI image generation | `gen_image` | `oanim assets gen-image` |
| AI image editing | `edit_image` | `oanim assets edit-image` |
| Background removal | `remove_bg` | `oanim assets remove-bg` |
| Image upscaling | `upscale` | `oanim assets upscale` |
| AI video generation | `gen_video` | `oanim assets run` (video models) |
| AI audio generation | `gen_audio` | `oanim assets run` (audio models) |
| Any fal.ai model | `run_model` | `oanim assets run` |
| Media compositing | — | `<Img>`, `<OffthreadVideo>`, `<Audio>` via `staticFile()` |

## References

- `references/workflow.md` — Step-by-step agent workflow
- `references/scene-config.md` — animate.json schema reference
- `references/composition-patterns.md` — Multi-scene composition architecture
- `references/animation-cookbook.md` — Full `@oanim/core` presets reference
- `references/asset-generation.md` — AI asset generation guide
- `references/media-guide.md` — Using generated media in compositions (Img, Video, Audio)

## Templates

- `templates/launch-video.md` — 4-scene product launch (5s)
- `templates/explainer.md` — Step-based explainer video (20s)
- `templates/logo-reveal.md` — Logo animation with glow (5s)
- `templates/meme-caption.md` — Vertical social clip (6s)
- `templates/investor-update.md` — Metrics dashboard (15s)
