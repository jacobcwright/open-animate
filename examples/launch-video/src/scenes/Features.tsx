import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  slideInLeft,
  Background,
  SafeArea,
  GlowOrb,
  Card,
  palettes,
} from '@oanim/core';

const colors = palettes.midnight;

const features = [
  { icon: '⚡', title: 'Instant Deploy', desc: 'Push to git, done.' },
  { icon: '🔒', title: 'Isolated Sandbox', desc: 'Every agent runs in E2B.' },
  { icon: '📊', title: 'Usage Dashboard', desc: 'Monitor everything.' },
];

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background gradient={`linear-gradient(135deg, ${colors.bg}, ${colors.bgAlt})`} />
      <GlowOrb color="rgba(34, 211, 238, 0.15)" x={20} y={50} size={500} />
      <GlowOrb color="rgba(129, 140, 248, 0.1)" x={80} y={30} size={400} />

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
          Everything You Need
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          {features.map((f, i) => (
            <Card
              key={i}
              delay={0.3 + i * 0.15}
              spring="snappy"
              style={{ width: 340, textAlign: 'center' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 18, color: colors.textMuted }}>
                {f.desc}
              </div>
            </Card>
          ))}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
