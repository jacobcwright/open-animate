import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  popIn,
  Background,
  SafeArea,
  GlowOrb,
  Grid,
  palettes,
} from '@oanim/core';

const colors = palettes.dark;

interface StepProps {
  number: number;
  title: string;
  description: string;
}

export const Step: React.FC<StepProps> = ({ number, title, description }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`linear-gradient(135deg, ${colors.bg}, ${colors.bgAlt})`}
      />
      <Grid cellSize={80} color="rgba(99, 102, 241, 0.03)" />
      <GlowOrb color="rgba(99, 102, 241, 0.2)" x={30} y={50} size={500} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Step number */}
        <div
          style={{
            ...popIn({ frame, fps, delay: 0.2, spring: 'bouncy' }),
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 36,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {number}
        </div>

        {/* Title */}
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.5 }),
            fontSize: 56,
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.9 }),
            fontSize: 26,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 650,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
