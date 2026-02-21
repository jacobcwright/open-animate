import React from 'react';
import { Composition } from 'remotion';
import { MemeCaption } from './MemeCaption';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MemeCaption"
      component={MemeCaption}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
