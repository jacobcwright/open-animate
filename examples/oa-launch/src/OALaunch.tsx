import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { wipe, scaleFade, morphExpand, clipCircle, fadeBlur } from '@oanim/core';
import { TheProblem } from './scenes/TheProblem';
import { TheReveal } from './scenes/TheReveal';
import { ThePower } from './scenes/ThePower';
import { TheDemo } from './scenes/TheDemo';
import { TheStack } from './scenes/TheStack';
import { TheCTA } from './scenes/TheCTA';

/**
 * Open Animate Launch Video — 6 scenes, 5 transitions, 829 frames (~28s @ 30fps).
 *
 * Frame math:
 *   (120+150+165+165+135+180) - (18+15+18+15+20) = 915 - 86 = 829
 */
export const OALaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0a09' }}>
      <Audio src={staticFile('bg-music.mp3')} volume={0.25} />

      <TransitionSeries>
        {/* Scene 1: The Problem — 4s (120f) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <TheProblem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'left' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />

        {/* Scene 2: The Reveal — 5s (150f) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TheReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={scaleFade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />

        {/* Scene 3: The Power — 5.5s (165f) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ThePower />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={morphExpand()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />

        {/* Scene 4: The Demo — 5.5s (165f) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <TheDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clipCircle()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />

        {/* Scene 5: The Stack — 4.5s (135f) */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <TheStack />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeBlur()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        {/* Scene 6: The CTA — 6s (180f) */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <TheCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
