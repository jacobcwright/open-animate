import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  popIn,
  Background,
  SafeArea,
  GlowOrb,
  Vignette,
  AnimatedCharacters,
  TypewriterText,
  palettes,
} from '@oanim/core';

const colors = palettes.midnight;

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(circle at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(129, 140, 248, 0.3)" x={50} y={45} size={800} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 36,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <AnimatedCharacters text="Start Building" delay={0.2} stagger={0.04} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.7 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          <TypewriterText
            text="npm install -g @castari/cli && cast deploy"
            delay={0.8}
            charsPerSecond={25}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>

        <div
          style={{
            ...popIn({ frame, fps, delay: 1.5 }),
            fontSize: 22,
            color: colors.primary,
            fontWeight: 600,
          }}
        >
          castari.dev
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
