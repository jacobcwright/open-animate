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

const colors = palettes.midnight;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 30% 40%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(129, 140, 248, 0.25)" x={25} y={35} size={600} />
      <GlowOrb color="rgba(167, 139, 250, 0.15)" x={75} y={65} size={500} />
      <Vignette intensity={0.4} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div style={blurIn({ frame, fps, delay: 0.1 })}>
          <Badge fontSize={18}>Introducing</Badge>
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <AnimatedCharacters text="Ship Faster" delay={0.3} stagger={0.04} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.8 }),
            fontSize: 30,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          One command to deploy your AI agent
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
