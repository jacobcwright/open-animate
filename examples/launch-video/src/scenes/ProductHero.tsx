import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeUp,
  popIn,
  Background,
  SafeArea,
  GlowOrb,
  Terminal,
  Vignette,
  Grid,
  palettes,
} from '@oanim/core';

const colors = palettes.midnight;

export const ProductHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background gradient={`linear-gradient(180deg, ${colors.bg}, ${colors.bgAlt})`} />
      <Grid cellSize={80} color="rgba(129, 140, 248, 0.03)" />
      <GlowOrb color="rgba(129, 140, 248, 0.2)" x={50} y={50} size={700} />
      <Vignette intensity={0.3} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 0.1 }),
            fontSize: 24,
            color: colors.accent,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Deploy in Seconds
        </div>

        <div style={popIn({ frame, fps, delay: 0.3 })}>
          <Terminal
            lines={[
              '$ cast deploy',
              '',
              '  Packaging agent...',
              '  Uploading to sandbox...',
              '  Starting health check...',
              '',
              '  ✓ Agent deployed successfully',
              '  → https://my-agent.castari.dev',
            ]}
            delay={0.5}
            charsPerSecond={40}
            style={{ width: 700 }}
          />
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
