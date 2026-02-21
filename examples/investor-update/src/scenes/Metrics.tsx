import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  Background,
  SafeArea,
  GlowOrb,
  Card,
  CountUp,
  Grid,
  palettes,
} from '@oanim/core';

const colors = palettes.ocean;

const metrics = [
  { label: 'MRR', to: 125, prefix: '$', suffix: 'K', decimals: 0 },
  { label: 'Customers', to: 340, prefix: '', suffix: '', decimals: 0 },
  { label: 'Growth', to: 42, prefix: '', suffix: '%', decimals: 0 },
];

export const Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`linear-gradient(135deg, ${colors.bg}, ${colors.bgAlt})`}
      />
      <Grid cellSize={80} color="rgba(14, 165, 233, 0.03)" />
      <GlowOrb color="rgba(14, 165, 233, 0.15)" x={50} y={50} size={700} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 48,
        }}
      >
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.1 }),
            fontSize: 48,
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Key Metrics
        </div>

        <div
          style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
          }}
        >
          {metrics.map((m, i) => (
            <Card
              key={i}
              delay={0.4 + i * 0.2}
              spring="snappy"
              style={{ width: 320, textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 12,
                }}
              >
                {m.label}
              </div>
              <CountUp
                to={m.to}
                prefix={m.prefix}
                suffix={m.suffix}
                decimals={m.decimals}
                delay={0.6 + i * 0.2}
                duration={1.5}
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: colors.primary,
                }}
              />
            </Card>
          ))}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
