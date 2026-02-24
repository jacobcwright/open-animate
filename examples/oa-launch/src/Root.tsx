import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { OALaunch } from './OALaunch';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OALaunch"
      component={OALaunch}
      durationInFrames={801}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
