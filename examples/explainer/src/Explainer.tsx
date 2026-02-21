import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { wipe } from '@oanim/core';
import { Intro } from './scenes/Intro';
import { Step } from './scenes/Step';

/**
 * 4-scene explainer video (20 seconds at 30fps = 600 frames).
 * Uses wipe transitions for forward progression.
 */
export const Explainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <TransitionSeries>
        {/* Scene 1: Intro — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'left' })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 30,
          })}
        />

        {/* Scene 2: Step 1 — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Step
            number={1}
            title="Install the CLI"
            description="One command to get started. Works with npm, pnpm, or yarn."
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'left' })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 30,
          })}
        />

        {/* Scene 3: Step 2 — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Step
            number={2}
            title="Create Your Project"
            description="Scaffold a Remotion project with premium presets pre-configured."
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'left' })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 30,
          })}
        />

        {/* Scene 4: Step 3 — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Step
            number={3}
            title="Render to Video"
            description="Export to MP4, WebM, or GIF with a single command."
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
