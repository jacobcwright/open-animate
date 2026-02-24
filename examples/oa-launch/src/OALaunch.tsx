import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { wipe, scaleFade, clipPolygon, zoomThrough, fadeBlur } from '@oanim/core';
import { inter } from './fonts';
import { TheIntro } from './scenes/TheIntro';
import { TheReveal } from './scenes/TheReveal';
import { ThePower } from './scenes/ThePower';
import { TheDemo } from './scenes/TheDemo';
import { TheStack } from './scenes/TheStack';
import { TheCTA } from './scenes/TheCTA';

/**
 * Open Animate Launch Video — 6 scenes, 5 transitions, 801 frames (~27s @ 30fps).
 *
 * Frame math:
 *   (150+120+120+210+105+150) - (12+10+10+10+12) = 855 - 54 = 801
 */
export const OALaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0a09', fontFamily: inter }}>
      <Audio src={staticFile('bg-music.mp3')} volume={0.25} />

      <TransitionSeries>
        {/* Scene 1: The Intro — 5s (150f) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TheIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zoomThrough()}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: 12 })}
        />

        {/* Scene 2: The Reveal — 4s (120f) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <TheReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clipPolygon()}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: 10 })}
        />

        {/* Scene 3: The Power — 4s (120f) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <ThePower />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'left' })}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: 10 })}
        />

        {/* Scene 4: The Demo — 7s (210f) */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <TheDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={scaleFade()}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: 10 })}
        />

        {/* Scene 5: The Stack — 3.5s (105f) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <TheStack />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zoomThrough()}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: 12 })}
        />

        {/* Scene 6: The CTA — 5s (150f) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TheCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
