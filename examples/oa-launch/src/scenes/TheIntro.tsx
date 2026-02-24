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
  SafeArea,
  AnimatedCharacters,
  Vignette,
  palettes,
} from '@oanim/core';
import { spaceGrotesk } from '../fonts';

const colors = palettes.sunset;

/**
 * Scene 1: The Intro — 150 frames (5s)
 * AI-generated video background + "Your agent can code." overlay
 */
export const TheIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile('intro-clip.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Dark overlay for text readability */}
      <AbsoluteFill style={{ backgroundColor: 'rgba(12, 10, 9, 0.55)' }} />
      <Vignette intensity={0.5} />

      <SafeArea
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            fontFamily: spaceGrotesk,
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
            fontFamily: spaceGrotesk,
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
