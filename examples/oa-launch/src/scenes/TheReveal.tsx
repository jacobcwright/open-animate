import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
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
 * Scene 2: The Reveal — 150 frames (5s)
 * AI-generated image background + "open animate" reveal
 */
export const TheReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />

      {/* AI-generated background image */}
      <AbsoluteFill>
        <Img
          src={staticFile('bg-gradient.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{ backgroundColor: 'rgba(12, 10, 9, 0.55)' }}
      />

      <GlowOrb color="rgba(249, 115, 22, 0.25)" x={50} y={45} size={800} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.15 }),
            fontSize: 20,
            fontWeight: 600,
            color: colors.textMuted,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Introducing
        </div>

        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <AnimatedCharacters text="open animate" delay={0.35} stagger={0.035} />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 2.0 }),
            fontSize: 32,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          The creative suite for agents.
        </div>

        <div style={blurIn({ frame, fps, delay: 3.2 })}>
          <Badge
            fontSize={16}
            bg="rgba(249, 115, 22, 0.12)"
            textColor={colors.secondary}
            borderColor="rgba(245, 158, 11, 0.3)"
          >
            Open Source — Apache 2.0
          </Badge>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
