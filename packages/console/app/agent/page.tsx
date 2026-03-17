import Link from 'next/link';

const AGENT_PAGE_MARKDOWN = `OPEN ANIMATE
  [Dashboard](/dashboard)  [Templates](/dashboard/templates)  [Docs](https://docs.open-animate.com)
  [GitHub](https://github.com/jacobcwright/open-animate)


# The creative suite for agents.

## Open-source toolkit that gives coding agents the power to generate images, compose videos, and create motion graphics — all through code.

\`npx oanim init my-video\`

Works with: Claude Code, Cursor, Codex, Windsurf, any agent that writes code


---


## Quickstart

Your agent's first video is 60 seconds away.

### Step 1 — Scaffold

\`\`\`
npx oanim init my-video
cd my-video
\`\`\`

Creates a project with @oanim/core — animation presets, transitions, components, and design tokens pre-configured.

### Step 2 — Compose

Your agent writes src/MyComp.tsx:

\`\`\`
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fadeUp, Background, SafeArea, palettes } from '@oanim/core';

const colors = palettes.dark;

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background gradient={\`linear-gradient(135deg, \${colors.bg}, \${colors.bgAlt})\`} />
      <SafeArea style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          ...fadeUp({ frame, fps, delay: 0.2 }),
          fontSize: 80,
          fontWeight: 700,
          color: colors.text,
        }}>
          Hello World
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
\`\`\`

### Step 3 — Preview

\`\`\`
npx remotion studio
\`\`\`

Opens a live preview at localhost:3000 with timeline scrubbing.

### Step 4 — Render

\`\`\`
npx oanim render
\`\`\`

Outputs out/MyComp.mp4. Override with flags:

\`\`\`
npx oanim render --fps 60 --res 3840x2160 --codec h265
\`\`\`

### Step 5 — Generate media (optional)

\`\`\`
npx oanim login
npx oanim assets gen-image --prompt "dark abstract gradient, purple and blue" --out public/bg.png
\`\`\`

You can also generate video and audio — see the Working with Media guide.


---


## Capabilities

- **AI Media Generation** — Generate images, video, and audio. Edit photos, remove backgrounds, upscale. Run any of 30+ AI models via \`oanim assets run\`.
- **Video Composition** — Compose React-based videos with Remotion. 8 animation presets, 14 transitions, typography, and production-ready components.
- **Design System** — 5 color palettes, font stacks, spacing, and components tuned for 1920x1080.
- **Cloud Rendering** — Render locally or in the cloud. No Chromium or ffmpeg needed for \`--cloud\`.


---


## Templates

- **Product Launch** (5s, 1920x1080) — Gradient background, logo pop-in, CTA slide. Uses: fadeUp, popIn, AnimatedCharacters, Background, SafeArea, Badge, Card
- **Explainer** (20s, 1920x1080) — 4 numbered steps with staggered entrances and fadeBlur transitions. Uses: AnimatedCharacters, fadeUp, wipe, clipCircle, Background, SafeArea, Grid
- **Logo Reveal** (5s, 1920x1080) — GlowOrb builds, logo snaps in with elasticScale, tagline fades up. Uses: popIn, blurIn, GlowOrb, Background, Vignette
- **Metrics Dashboard** (15s, 1920x1080) — CountUp animations for revenue, users, and growth. Uses: CountUp, fadeUp, Card, Background, SafeArea, palettes.midnight
- **Meme Caption** (6s, 1080x1920) — Vertical. Bold text, shake entrance, zoom. Uses: fadeUp, elasticScale, Background, SafeArea
- **Hello World** (5s, 1920x1080) — Minimal. Single fadeUp on centered text.


---


## Packages

| Package | Description |
|---------|-------------|
| \`oanim\` | CLI — scaffolding, rendering, asset generation |
| \`@oanim/core\` | Animation presets, transitions, components, design tokens |


---


## llms.txt

- [oanim assets](https://docs.open-animate.com/cli/assets.md): Generate images, video, audio, and more with AI
- [oanim init](https://docs.open-animate.com/cli/init.md): Scaffold a new video project
- [oanim render](https://docs.open-animate.com/cli/render.md): Export your composition to MP4
- [Design Tokens](https://docs.open-animate.com/core/design-tokens.md): Color palettes, font stacks, and spacing scale
- [Element Animations](https://docs.open-animate.com/core/element-animations.md): 8 animation presets
- [Springs & Easings](https://docs.open-animate.com/core/springs-and-easings.md): Spring presets and easing curves
- [Transitions](https://docs.open-animate.com/core/transitions.md): 14 drop-in transition presets for scene changes
- [Typography](https://docs.open-animate.com/core/typography.md): AnimatedCharacters, TypewriterText, and CountUp
- [UI Components](https://docs.open-animate.com/core/ui-components.md): Composable building blocks for scene layouts
- [Agent Skill](https://docs.open-animate.com/guides/agent-skill.md): Structured references and templates for agents
- [Composition Patterns](https://docs.open-animate.com/guides/composition-patterns.md): Multi-scene architecture and layering
- [Working with Media](https://docs.open-animate.com/guides/media.md): Generate images, video, and audio with AI
- [Introduction](https://docs.open-animate.com/index.md): The open-source creative suite for AI agents
- [API Keys](https://docs.open-animate.com/platform/api-keys.md): Create and manage API keys
- [Authentication](https://docs.open-animate.com/platform/authentication.md): Sign in via browser OAuth or API key
- [Cloud Rendering](https://docs.open-animate.com/platform/cloud-rendering.md): Render videos in the cloud
- [Console](https://docs.open-animate.com/platform/console.md): Web dashboard for managing your account
- [Credits & Billing](https://docs.open-animate.com/platform/credits-and-billing.md): Pay-as-you-go credits
- [Platform Overview](https://docs.open-animate.com/platform/overview.md): Hosted infrastructure overview
- [Self-Hosting](https://docs.open-animate.com/platform/self-hosting.md): Run the platform on your own infrastructure
- [Usage](https://docs.open-animate.com/platform/usage.md): Track credit balance and usage history
- [Quickstart](https://docs.open-animate.com/quickstart.md): Your agent's first video in 60 seconds
- [Templates](https://docs.open-animate.com/templates.md): Pre-built video compositions
- [GitHub](https://github.com/jacobcwright/open-animate)


---


Apache 2.0 — Everything is open source and self-hostable.
[Get Started](https://oanim.dev/dashboard)  [Docs](https://docs.open-animate.com)  [GitHub](https://github.com/jacobcwright/open-animate)
`;

function parseMarkdown(raw: string) {
  const blocks: { type: 'line' | 'code'; content: string }[] = [];
  let inCode = false;
  let codeAccum: string[] = [];

  for (const line of raw.split('\n')) {
    if (line.startsWith('```')) {
      if (inCode) {
        blocks.push({ type: 'code', content: codeAccum.join('\n') });
        codeAccum = [];
        inCode = false;
      } else {
        inCode = true;
      }
    } else if (inCode) {
      codeAccum.push(line);
    } else {
      blocks.push({ type: 'line', content: line });
    }
  }

  return blocks;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    if (boldMatch) {
      const [, before, bold, after] = boldMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(<span key={key++} className="text-neutral-300">{bold}</span>);
      remaining = after;
      continue;
    }

    const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)$/);
    if (linkMatch) {
      const [, before, label, href, after] = linkMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(
        <span key={key++}>
          <span className="text-neutral-600">[</span>
          <a href={href} className="text-neutral-300 hover:text-white">{label}</a>
          <span className="text-neutral-600">]</span>
          <span className="text-neutral-800">({href})</span>
        </span>
      );
      remaining = after;
      continue;
    }

    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);
    if (codeMatch) {
      const [, before, code, after] = codeMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(<code key={key++} className="text-neutral-300">{code}</code>);
      remaining = after;
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}

export default function AgentPage() {
  const blocks = parseMarkdown(AGENT_PAGE_MARKDOWN.trim());

  return (
    <div className="min-h-screen bg-black">
      {/* Toggle */}
      <div className="flex justify-center pt-10">
        <div className="flex items-center border border-neutral-800 bg-neutral-950 p-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            Human
          </Link>
          <span className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest bg-white text-black">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            Agent
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-8 pb-24 font-[family-name:var(--font-jetbrains-mono)] text-[13px] leading-[1.7]">
        {blocks.map((block, i) => {
          if (block.type === 'code') {
            return (
              <pre key={i} className="bg-neutral-950 border border-neutral-900 px-4 py-3 my-1 text-neutral-400 overflow-x-auto text-[13px] leading-[1.7]">
                {block.content}
              </pre>
            );
          }

          const line = block.content;

          if (line.startsWith('# ')) {
            return <p key={i} className="text-white mt-8 mb-1">{line}</p>;
          }
          if (line.startsWith('## ')) {
            return <p key={i} className="text-neutral-400 mt-6 mb-1">{line}</p>;
          }
          if (line.startsWith('### ')) {
            return <p key={i} className="text-neutral-500 mt-4 mb-0.5">{line}</p>;
          }
          if (line === '---') {
            return <div key={i} className="border-t border-neutral-900 my-6" />;
          }
          if (line.startsWith('| ')) {
            return <p key={i} className="text-neutral-500">{line}</p>;
          }
          if (line.trim() === '') {
            return <div key={i} className="h-2" />;
          }
          return <p key={i} className="text-neutral-500"><InlineMarkdown text={line} /></p>;
        })}
      </div>
    </div>
  );
}
