# Open Animate

[![npm](https://img.shields.io/npm/v/oanim)](https://www.npmjs.com/package/oanim)
[![npm](https://img.shields.io/npm/v/@oanim/core)](https://www.npmjs.com/package/@oanim/core)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**The open-source creative suite for AI agents.**

Open Animate gives coding agents the tools to generate images, compose videos, and create motion graphics — all through code.

[Website](https://open-animate.com) &middot; [Docs](https://docs.open-animate.com) &middot; [npm](https://www.npmjs.com/package/oanim)

## Quickstart

```bash
npx oanim init my-video
cd my-video
npx remotion studio       # preview
npx oanim render          # export MP4
```

## Works with

Claude Code &middot; Cursor &middot; Codex &middot; Windsurf &middot; any agent that writes code

## Capabilities

| | |
|---|---|
| **AI Media Generation** | Generate images, video, and audio. Edit photos, remove backgrounds, upscale. Run any ai model via `oanim assets run`. Multi-provider media gateway with 30+ supported models. |
| **Video Composition** | Compose React-based videos with [Remotion](https://remotion.dev). 8 animation presets, 14 transitions, typography, and production-ready UI components via `@oanim/core`. |
| **Design System** | 5 color palettes, font stacks, spacing scale, and components tuned for 1920x1080 |
| **Cloud Rendering** | Render locally or `oanim render --cloud` — no Chromium or ffmpeg needed |

## Templates

| Template | Description | Duration |
|---|---|---|
| [Product Launch](examples/launch-video) | Gradient background, logo pop-in, CTA slide | 5s |
| [Explainer](examples/explainer) | Numbered steps with staggered entrances and transitions | 20s |
| [Logo Reveal](examples/logo-reveal) | GlowOrb builds, logo snaps in with elasticScale | 5s |
| [Metrics Dashboard](examples/investor-update) | CountUp animations for revenue, users, and growth | 15s |
| [Meme Caption](examples/meme-caption) | Vertical 1080x1920 — bold text, shake, zoom | 6s |

## Packages

```bash
npm install @oanim/core    # animation presets, transitions, components, design tokens
npx oanim init             # CLI — scaffolding, rendering, asset generation
```

| Package | npm |
|---------|-----|
| `@oanim/core` | [![npm](https://img.shields.io/npm/v/@oanim/core)](https://www.npmjs.com/package/@oanim/core) |
| `oanim` | [![npm](https://img.shields.io/npm/v/oanim)](https://www.npmjs.com/package/oanim) |

## Agent Skill

Install the skill so your agent knows how to use Open Animate:

```bash
# skills.sh (41 compatible agents)
npx skills add jacobcwright/open-animate

# ClawHub (OpenClaw)
clawhub install oanim
```

The skill includes workflow instructions, animation reference, composition patterns, and 5 video templates.

## CLI

| Command | Description |
|---|---|
| `oanim init [name]` | Scaffold a video project |
| `oanim render` | Export MP4 (local or `--cloud`) |
| `oanim assets gen-image` | Generate image from text prompt |
| `oanim assets edit-image` | Edit image with text prompt |
| `oanim assets remove-bg` | Remove image background |
| `oanim assets upscale` | 2x upscale image |
| `oanim assets run` | Run any fal.ai model (image, video, audio, etc.) |
| `oanim login` | Authenticate with the platform |
| `oanim billing` | Check balance, purchase credits |
| `oanim usage` | View usage history |
| `oanim api-keys` | Create and manage API keys |

## Platform

Open Animate is **open-core** — everything is Apache 2.0 and self-hostable. The hosted platform at `api.oanim.dev` handles auth, billing, cloud rendering, and the media gateway.

New accounts get **$5.00 free credits**. No credit card required.

See the [Platform docs](https://docs.open-animate.com/platform/overview) for details.

## Development

```bash
pnpm install          # install workspace deps
pnpm build            # build core + cli
```

## Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

## License

[Apache 2.0](LICENSE)
