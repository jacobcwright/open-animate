# Working with Media

## The pattern: Generate → Download → Use

Every media type follows the same workflow:
1. **Generate** with MCP tools or `oanim assets`
2. **Download** to `public/` (MCP: `curl -o`, CLI: `--out` flag)
3. **Use** via `staticFile()` in Remotion

## Images

### MCP tool: `gen_image`
```
Tool: gen_image
Input: { "prompt": "abstract warm gradient, dark bg, 16:9" }
→ { "url": "https://...", "model": "fal-ai/flux/schnell", "estimatedCostUsd": 0.0042 }
```
```bash
curl -o public/bg.png "<url>"
```

### CLI
```bash
oanim assets gen-image --prompt "abstract warm gradient, dark bg, 16:9" --out public/bg.png
```

### Use in Remotion
```tsx
import { Img, staticFile } from 'remotion';

<Img
  src={staticFile('bg.png')}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

## Video

### MCP tool: `gen_video`
```
Tool: gen_video
Input: { "prompt": "cinematic zoom, flowing shapes, warm tones", "duration": "5" }
→ { "url": "https://...", "model": "fal-ai/kling-video/v1/standard/text-to-video", "estimatedCostUsd": 0.315 }
```
```bash
curl -o public/clip.mp4 "<url>"
```

### MCP tool: `run_model` (for specific video models)
```
Tool: run_model
Input: {
  "model": "fal-ai/minimax-video/video-01-live",
  "input": { "prompt": "cinematic zoom, flowing shapes" },
  "async": true
}
```

### CLI
```bash
oanim assets run \
  --model fal-ai/kling-video/v1/standard/text-to-video \
  --input '{"prompt":"cinematic zoom, flowing shapes, warm tones","duration":"5"}' \
  --out public/clip.mp4
```

### Use in Remotion
```tsx
import { OffthreadVideo, staticFile } from 'remotion';

<OffthreadVideo
  src={staticFile('clip.mp4')}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

Available video models:
| Model | Notes |
|-------|-------|
| `fal-ai/kling-video/v1/standard/text-to-video` | Good quality, 5s clips |
| `fal-ai/kling-video/v1.5/pro/text-to-video` | Higher quality |
| `fal-ai/minimax-video/video-01-live` | Fast generation |
| `fal-ai/hunyuan-video` | High quality |

## Audio

### MCP tool: `gen_audio`
```
Tool: gen_audio
Input: { "prompt": "minimal ambient electronic, warm pads, no vocals", "duration_in_seconds": 30 }
→ { "url": "https://...", "model": "fal-ai/stable-audio", "estimatedCostUsd": 0.0 }
```
```bash
curl -o public/bg-music.mp3 "<url>"
```

### CLI
```bash
oanim assets run \
  --model fal-ai/stable-audio \
  --input '{"prompt":"minimal ambient electronic, warm pads, no vocals","duration_in_seconds":30}' \
  --out public/bg-music.mp3
```

### Use in Remotion
```tsx
import { Audio, staticFile } from 'remotion';

// Place at composition level (outside TransitionSeries) for global audio
<Audio src={staticFile('bg-music.mp3')} volume={0.25} />
```

## Layer order (back to front)

1. `<OffthreadVideo>` or `<Img>` — media background
2. `<AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>` — dark overlay
3. `<GlowOrb>` — ambient glow
4. `<Vignette>` — edge darkening
5. `<SafeArea>` — content (text, cards, etc.)
6. `<Audio>` — non-visual, position doesn't matter

## Tips

- Use `objectFit: 'cover'` for full-bleed backgrounds
- Always add a dark overlay between media and text
- Keep audio at `volume={0.2}` to `volume={0.3}` for background music
- Use `<OffthreadVideo>` (not `<Video>`) — decodes on separate thread
- Trim clips with `startFrom={30}` to skip frames
- Generate backgrounds at 1920x1080 to match video resolution
