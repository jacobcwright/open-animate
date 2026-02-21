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
  palettes,
} from '@oanim/core';

const colors = palettes.ocean;

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(circle at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(14, 165, 233, 0.3)" x={50} y={45} size={700} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <AnimatedCharacters text="Thank You" delay={0.2} stagger={0.05} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.8 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          Questions? Reach out anytime.
        </div>

        <div
          style={{
            ...popIn({ frame, fps, delay: 1.2 }),
            fontSize: 22,
            color: colors.accent,
            fontWeight: 600,
          }}
        >
          investors@acme.com
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
