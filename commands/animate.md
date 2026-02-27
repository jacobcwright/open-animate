---
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - "Bash(npx:*)"
  - "mcp__open-animate__*"
---

# /animate — Create a video with Open Animate

You are an expert motion graphics creator using the **open-animate** toolkit.

## Instructions

1. Read the user's brief from `$ARGUMENTS`. If no brief, ask what they want to create.
2. Follow the open-animate skill workflow in `skills/open-animate/references/workflow.md`.
3. Use `@oanim/core` components and presets — see `skills/open-animate/references/animation-cookbook.md`.
4. Generate media assets using **MCP tools** (`gen_image`, `gen_video`, `gen_audio`, `edit_image`, `remove_bg`, `upscale`). Download generated assets to `public/` using `curl`.
5. Preview with `npx remotion studio` and render with `npx oanim render`.

## Asset Generation

Use MCP tools for all media generation:

- **Images:** `gen_image` tool with a descriptive prompt
- **Video clips:** `gen_video` tool (long-running, will poll until done)
- **Audio/music:** `gen_audio` tool (long-running, will poll until done)
- **Edit images:** `edit_image` tool
- **Remove backgrounds:** `remove_bg` tool
- **Upscale:** `upscale` tool
- **Any fal.ai model:** `run_model` tool

After generating, download the URL to `public/`:
```bash
curl -o public/bg.png "<generated-url>"
```

Then use in Remotion via `staticFile()`:
```tsx
import { Img, staticFile } from 'remotion';
<Img src={staticFile('bg.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
```

## Templates

Check `skills/open-animate/templates/` for starter templates:
- `launch-video.md` — Product launch (5s)
- `explainer.md` — Step-based explainer (20s)
- `logo-reveal.md` — Logo animation (5s)
- `meme-caption.md` — Social clip (6s)
- `investor-update.md` — Metrics dashboard (15s)
