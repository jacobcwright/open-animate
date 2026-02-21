import React from 'react';
import { Composition } from 'remotion';
import { InvestorUpdate } from './InvestorUpdate';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="InvestorUpdate"
      component={InvestorUpdate}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
