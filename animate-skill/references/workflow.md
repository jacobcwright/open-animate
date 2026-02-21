# Agent Workflow

## Step-by-step process for creating a video

### 1. Understand the brief
- What is the video for? (product launch, explainer, social clip, etc.)
- Duration target? (default: 15s = 450 frames at 30fps)
- Style? (dark/minimal, colorful, corporate, etc.)
- Key messages or scenes?

### 2. Initialize project
```bash
oanim init <project-name>
cd <project-name>
```

### 3. Plan the composition structure
- Break the video into **scenes** (3-5 scenes for a 15s video)
- Each scene has a clear purpose (hook, demo, features, CTA)
- Plan transitions between scenes

### 4. Choose a color palette
```tsx
import { palettes } from '@oanim/core';
// Available: dark, light, midnight, sunset, ocean
const colors = palettes.midnight;
```

### 5. Build scenes
Create each scene as its own component in `src/scenes/`:
```tsx
// src/scenes/Hook.tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fadeUp, Background, SafeArea, palettes } from '@oanim/core';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ...
};
```

### 6. Compose with TransitionSeries
```tsx
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fadeBlur, scaleFade } from '@oanim/core';
```

### 7. Layer the scene (back to front)
1. `<Background>` — gradient base
2. `<GlowOrb>` — ambient glow elements
3. `<Grid>` — subtle pattern (optional)
4. `<Vignette>` — edge darkening (optional)
5. `<SafeArea>` — content wrapper with safe margins
6. Content — text, cards, terminals, etc.

### 8. Animate content with delays
Stagger elements by increasing the `delay` parameter:
```tsx
<div style={fadeUp({ frame, fps, delay: 0.1 })}>First</div>
<div style={fadeUp({ frame, fps, delay: 0.3 })}>Second</div>
<div style={fadeUp({ frame, fps, delay: 0.5 })}>Third</div>
```

### 9. Preview and iterate
```bash
npx remotion studio
```

### 10. Render
```bash
oanim render --out out/video.mp4
```

## Tips
- Keep scenes focused — one idea per scene
- Use consistent spring presets within a video
- 0.1-0.2s delay between staggered elements feels natural
- Background elements (GlowOrb, Grid) add depth without effort
- Always wrap content in `<SafeArea>` for broadcast-safe margins
