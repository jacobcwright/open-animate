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

const colors = palettes.sunset;

/**
 * Scene 1: The Problem — 120 frames (4s)
 * Badge → AnimatedCharacters "Your agent can code." → "But it can't create." → subtitle
 */
export const TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 30% 40%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(249, 115, 22, 0.2)" x={25} y={35} size={600} />
      <GlowOrb color="rgba(245, 158, 11, 0.12)" x={75} y={65} size={500} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={blurIn({ frame, fps, delay: 0.05 })}>
          <Badge
            fontSize={16}
            bg="rgba(249, 115, 22, 0.15)"
            textColor={colors.primary}
            borderColor="rgba(249, 115, 22, 0.3)"
          >
            Every agent builder's problem
          </Badge>
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
          <AnimatedCharacters text="Your agent can code." delay={0.2} stagger={0.025} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.2 }),
            fontSize: 72,
            fontWeight: 800,
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          But it can't create.
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 2.2 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          No images. No video. No motion graphics.
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
