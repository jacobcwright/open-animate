import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  fadeDown,
  fadeUp,
  popIn,
  Background,
  SafeArea,
  palettes,
} from '@oanim/core';

const colors = palettes.sunset;

export const MemeCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`linear-gradient(180deg, ${colors.bg}, ${colors.bgAlt})`}
      />

      <SafeArea
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 120,
        }}
      >
        {/* Top caption */}
        <div
          style={{
            ...fadeDown({ frame, fps, delay: 0.2 }),
            fontSize: 64,
            fontWeight: 800,
            color: colors.text,
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          When the code compiles
          <br />
          on the first try
        </div>

        {/* Center emoji */}
        <div
          style={{
            ...popIn({ frame, fps, delay: 0.8, spring: 'bouncy' }),
            fontSize: 200,
          }}
        >
          🤯
        </div>

        {/* Bottom handle */}
        <div
          style={{
            ...fadeUp({ frame, fps, delay: 1.4 }),
            fontSize: 32,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          @oanim
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
