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
  palettes,
} from '@oanim/core';

const colors = palettes.dark;

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`linear-gradient(135deg, ${colors.bg}, ${colors.bgAlt})`}
      />
      <GlowOrb color="rgba(99, 102, 241, 0.3)" x={30} y={40} size={500} />
      <GlowOrb color="rgba(139, 92, 246, 0.2)" x={70} y={60} size={400} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={popIn({ frame, fps, delay: 0.1 })}>
          <Badge>oanim v0.1</Badge>
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.3 }),
            fontSize: 72,
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          <AnimatedCharacters
            text="Hello, Motion"
            delay={0.4}
            stagger={0.04}
          />
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.8 }),
            fontSize: 28,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          Premium animations for Remotion
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
