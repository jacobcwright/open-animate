import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { scaleFade } from '@oanim/core';
import { Title } from './scenes/Title';
import { Metrics } from './scenes/Metrics';
import { Closing } from './scenes/Closing';

/**
 * 3-scene investor update video (15 seconds at 30fps = 450 frames).
 * Uses scaleFade transitions and the ocean palette.
 */
export const InvestorUpdate: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c1222' }}>
      <TransitionSeries>
        {/* Scene 1: Title — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Title />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={scaleFade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 25,
          })}
        />

        {/* Scene 2: Metrics — 6s */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Metrics />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={scaleFade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 25,
          })}
        />

        {/* Scene 3: Closing — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
