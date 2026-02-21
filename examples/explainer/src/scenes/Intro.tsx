import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  popIn,
  Background,
  SafeArea,
  GlowOrb,
  Badge,
  AnimatedCharacters,
  Vignette,
  palettes,
} from '@oanim/core';

const colors = palettes.dark;

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 40%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(99, 102, 241, 0.3)" x={50} y={40} size={600} />
      <Vignette intensity={0.3} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div style={popIn({ frame, fps, delay: 0.2 })}>
          <Badge fontSize={18}>How It Works</Badge>
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <AnimatedCharacters text="3 Simple Steps" delay={0.4} stagger={0.04} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.0 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          From zero to rendered video in minutes
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
