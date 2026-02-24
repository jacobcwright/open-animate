import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  fadeUp,
  Background,
  SafeArea,
  GlowOrb,
  Vignette,
  palettes,
} from '@oanim/core';
import { spaceGrotesk } from '../fonts';

const colors = palettes.sunset;

/**
 * Scene 3: The Power — 165 frames (5.5s)
 * AI-generated video background + "Generate. Compose. Render." overlay
 */
export const ThePower: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        gradient={`radial-gradient(ellipse at 50% 50%, ${colors.bgAlt}, ${colors.bg})`}
      />

      {/* AI-generated video background */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile('abstract-clip.mp4')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{ backgroundColor: 'rgba(12, 10, 9, 0.5)' }}
      />

      <GlowOrb color="rgba(249, 115, 22, 0.2)" x={50} y={50} size={700} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {['Generate.', 'Compose.', 'Render.'].map((word, i) => (
            <div
              key={word}
              style={{
                ...fadeUp({ frame, fps, delay: 0.3 + i * 0.5 }),
                fontSize: 72,
                fontWeight: 800,
                fontFamily: spaceGrotesk,
                color: i === 0 ? colors.primary : colors.text,
                textAlign: 'center',
              }}
            >
              {word}
            </div>
          ))}
        </div>

        <div
          style={{
            ...fadeUp({ frame, fps, delay: 2.5 }),
            fontSize: 26,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          AI images, video, and audio — powered by 30+ models
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
