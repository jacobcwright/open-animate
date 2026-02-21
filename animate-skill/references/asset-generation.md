# Asset Generation

Generate images for your videos using fal.ai via the oanim CLI.

## Setup

1. Get a fal.ai API key at https://fal.ai/dashboard/keys
2. Set the environment variable:
```bash
export ANIMATE_FAL_KEY=your-key-here
```

## Commands

### Generate an image
```bash
oanim assets gen-image --prompt "dark abstract gradient with purple and blue tones, 16:9" --out public/bg.png
```

### Edit an existing image
```bash
oanim assets edit-image --in public/bg.png --prompt "add subtle grid pattern" --out public/bg-grid.png
```

### Remove background
```bash
oanim assets remove-bg --in public/product.png --out public/product-cutout.png
```

### Upscale 2x
```bash
oanim assets upscale --in public/logo-small.png --out public/logo-2x.png
```

## When to use asset generation

| Scenario | Command |
|----------|---------|
| Background textures/gradients | `gen-image` |
| Product screenshots with edits | `edit-image` |
| Product photos for compositing | `remove-bg` |
| Low-res logos or icons | `upscale` |

## Tips

- Generate backgrounds at the video resolution (1920x1080 by default)
- Use `staticFile()` in Remotion to reference files in `public/`
- Remove backgrounds for product shots so they composite cleanly over gradient backgrounds
- For text-heavy videos, generate abstract/blurred backgrounds that don't compete with text
