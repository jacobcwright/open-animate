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
import { spaceGrotesk } from '../fonts';

const colors = palettes.sunset;

const agents = ['Claude Code', 'Cursor', 'Codex', 'OpenClaw'];

/**
 * Scene 5: The Stack — 105 frames (3.5s)
 * AnimatedCharacters "Works with every agent" → Agent badges → tagline
 */
export const TheStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 40%, ${colors.bgAlt}, ${colors.bg})`}
      />
      <GlowOrb color="rgba(245, 158, 11, 0.18)" x={50} y={40} size={600} />
      <Vignette intensity={0.4} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: spaceGrotesk,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          <AnimatedCharacters text="Works with every agent" delay={0.1} stagger={0.02} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {agents.map((agent, i) => (
            <div key={agent} style={blurIn({ frame, fps, delay: 0.7 + i * 0.12 })}>
              <Badge
                fontSize={18}
                bg="rgba(249, 115, 22, 0.1)"
                textColor={colors.text}
                borderColor="rgba(249, 115, 22, 0.25)"
              >
                {agent}
              </Badge>
            </div>
          ))}
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.6 }),
            fontSize: 26,
            color: colors.primary,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Open-source creative suite for agents.
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
