# Asset Generation

Generate images, video, and audio for your videos. Two methods are available: **MCP tools** (preferred, works in sandboxed environments) and **CLI** (requires outbound HTTP).

## Setup

### MCP (Cowork / plugin)
Set `ANIMATE_API_KEY` environment variable. The MCP server authenticates automatically.

### CLI
Sign in to the oanim platform:
```bash
oanim login
```

## Image Generation

### MCP tool: `gen_image`
```
Tool: gen_image
Input: { "prompt": "dark abstract gradient with purple and blue tones, 16:9" }
```
Then download the returned URL:
```bash
curl -o public/bg.png "<returned-url>"
```

### CLI
```bash
oanim assets gen-image --prompt "dark abstract gradient with purple and blue tones, 16:9" --out public/bg.png
```

## Image Editing

### MCP tool: `edit_image`
```
Tool: edit_image
Input: { "image_url": "https://...", "prompt": "add subtle grid pattern" }
```
Then download:
```bash
curl -o public/bg-grid.png "<returned-url>"
```

### CLI
```bash
oanim assets edit-image --in public/bg.png --prompt "add subtle grid pattern" --out public/bg-grid.png
```

## Background Removal

### MCP tool: `remove_bg`
```
Tool: remove_bg
Input: { "image_url": "https://..." }
```
Then download:
```bash
curl -o public/product-cutout.png "<returned-url>"
```

### CLI
```bash
oanim assets remove-bg --in public/product.png --out public/product-cutout.png
```

## Upscaling

### MCP tool: `upscale`
```
Tool: upscale
Input: { "image_url": "https://..." }
```
Then download:
```bash
curl -o public/logo-2x.png "<returned-url>"
```

### CLI
```bash
oanim assets upscale --in public/logo-small.png --out public/logo-2x.png
```

## When to use asset generation

| Scenario | MCP Tool | CLI Command |
|----------|----------|-------------|
| Background textures/gradients | `gen_image` | `gen-image` |
| Product screenshots with edits | `edit_image` | `edit-image` |
| Product photos for compositing | `remove_bg` | `remove-bg` |
| Low-res logos or icons | `upscale` | `upscale` |

## Video Generation

### MCP tool: `gen_video`
```
Tool: gen_video
Input: { "prompt": "slow cinematic zoom, abstract flowing shapes, warm tones", "duration": "5" }
```
This tool polls until the video is ready (may take several minutes). Download the result:
```bash
curl -o public/clip.mp4 "<returned-url>"
```

### MCP tool: `run_model` (alternative, for specific models)
```
Tool: run_model
Input: { "model": "fal-ai/minimax-video/video-01-live", "input": {"prompt": "..."}, "async": true }
```

### CLI
```bash
oanim assets run --model fal-ai/kling-video/v1/standard/text-to-video \
  --input '{"prompt":"slow cinematic zoom, abstract flowing shapes, warm tones","duration":"5"}' \
  --out public/clip.mp4
```

Other video models: `fal-ai/minimax-video/video-01-live`, `fal-ai/hunyuan-video`, `fal-ai/kling-video/v1.5/pro/text-to-video`

## Audio Generation

### MCP tool: `gen_audio`
```
Tool: gen_audio
Input: { "prompt": "minimal ambient electronic, warm pads, no vocals", "duration_in_seconds": 30 }
```
Download the result:
```bash
curl -o public/bg-music.mp3 "<returned-url>"
```

### CLI
```bash
oanim assets run --model fal-ai/stable-audio \
  --input '{"prompt":"minimal ambient electronic, warm pads, no vocals","duration_in_seconds":30}' \
  --out public/bg-music.mp3
```

## Using generated assets in compositions

All generated assets go in `public/` and are referenced via `staticFile()`:

```tsx
import { Img, OffthreadVideo, Audio, staticFile } from 'remotion';

// Image background
<Img
  src={staticFile('bg.png')}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>

// Video background (use OffthreadVideo, not Video — decodes on separate thread)
<OffthreadVideo
  src={staticFile('clip.mp4')}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>

// Global audio track (place outside TransitionSeries for cross-scene audio)
<Audio src={staticFile('bg-music.mp3')} volume={0.25} />
```

Always add a dark overlay between media backgrounds and text:
```tsx
<AbsoluteFill style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
```

## Tips

- Generate backgrounds at the video resolution (1920x1080 by default)
- Use `staticFile()` in Remotion to reference files in `public/`
- Remove backgrounds for product shots so they composite cleanly over gradient backgrounds
- For text-heavy videos, generate abstract/blurred backgrounds that don't compete with text
- Use `objectFit: 'cover'` for full-bleed backgrounds
- Keep audio at `volume={0.2}` to `volume={0.3}` for background music
