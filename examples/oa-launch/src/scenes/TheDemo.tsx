import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  Background,
  SafeArea,
  GlowOrb,
  Terminal,
  Vignette,
  palettes,
} from '@oanim/core';

const colors = palettes.sunset;

/**
 * Scene 4: The Demo — 165 frames (5.5s)
 * Terminal showing asset generation + render workflow
 */
export const TheDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 60% 30%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(249, 115, 22, 0.18)" x={60} y={30} size={600} />
      <Vignette intensity={0.3} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.1 }),
            fontSize: 44,
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          The full pipeline
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.4 }),
            width: '100%',
            maxWidth: 900,
          }}
        >
          <Terminal
            title="oanim"
            delay={0.7}
            charsPerSecond={30}
            lines={[
              '$ oanim assets gen-image --prompt "gradient bg" --out public/bg.png',
              '  ✓ Generated bg.png (1920×1080)',
              '',
              '$ oanim assets run --model fal-ai/kling-video/v1/standard/text-to-video',
              '  ✓ Generated clip.mp4 (5s)',
              '',
              '$ oanim render',
              '  ████████████████████████ 100%',
              '  ✓ Output: out/video.mp4',
            ]}
            bg="rgba(12, 10, 9, 0.9)"
            textColor={colors.text}
            fontSize={19}
          />
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
