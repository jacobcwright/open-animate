import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  blurIn,
  Background,
  SafeArea,
  GlowOrb,
  Badge,
  AnimatedCharacters,
  Vignette,
  palettes,
} from '@oanim/core';

const colors = palettes.ocean;

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(14, 165, 233, 0.25)" x={50} y={45} size={600} />
      <GlowOrb color="rgba(20, 184, 166, 0.15)" x={70} y={60} size={400} />
      <Vignette intensity={0.4} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div style={blurIn({ frame, fps, delay: 0.1 })}>
          <Badge fontSize={18}>Q4 2025</Badge>
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
          <AnimatedCharacters text="Investor Update" delay={0.3} stagger={0.04} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.0 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          Acme Corp — Series A
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
