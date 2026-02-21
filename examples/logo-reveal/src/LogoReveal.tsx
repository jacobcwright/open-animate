import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  popIn,
  fadeUp,
  Background,
  SafeArea,
  GlowOrb,
  palettes,
} from '@oanim/core';

const colors = palettes.dark;

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(99, 102, 241, 0.35)" x={50} y={45} size={600} />
      <GlowOrb color="rgba(139, 92, 246, 0.2)" x={35} y={55} size={400} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Logo */}
        <div
          style={{
            ...popIn({ frame, fps, delay: 0.4, spring: 'bouncy' }),
            fontSize: 120,
            fontWeight: 800,
            color: colors.text,
            letterSpacing: '-0.03em',
          }}
        >
          oanim
        </div>

        {/* Tagline */}
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.0 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          Premium motion graphics for Remotion
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
