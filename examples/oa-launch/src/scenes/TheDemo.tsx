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
import { spaceGrotesk } from '../fonts';

const colors = palettes.sunset;

/**
 * Scene 4: The Demo — 210 frames (7s)
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
            fontFamily: spaceGrotesk,
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
            charsPerSecond={60}
            lines={[
              '$ npx skills add jacobcwright/open-animate',
              '  ✓ Skill added to Claude Code',
              '',
              '> "Create a launch video for my startup"',
              '',
              '$ oanim assets gen-image --prompt "gradient bg"',
              '  ✓ bg.png (1920×1080)',
              '$ oanim assets gen-video --prompt "particles"',
              '  ✓ clip.mp4 (5s)',
              '$ oanim render',
              '  ████████████████████████ 100%',
              '  ✓ out/video.mp4',
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
