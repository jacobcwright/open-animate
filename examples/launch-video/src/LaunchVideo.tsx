import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fadeBlur, scaleFade, clipCircle } from '@oanim/core';
import { Hook } from './scenes/Hook';
import { ProductHero } from './scenes/ProductHero';
import { Features } from './scenes/Features';
import { CTA } from './scenes/CTA';

/**
 * 4-scene product launch video (15 seconds at 30fps = 450 frames).
 * Uses TransitionSeries with oanim transition presets.
 */
export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      <TransitionSeries>
        {/* Scene 1: Hook — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeBlur()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 30,
          })}
        />

        {/* Scene 2: Product Hero — 4.5s */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <ProductHero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={scaleFade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 25,
          })}
        />

        {/* Scene 3: Features — 3.5s */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <Features />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clipCircle()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 30,
          })}
        />

        {/* Scene 4: CTA — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
