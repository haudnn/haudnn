import React from 'react';
import { Composition } from 'remotion';
import { DURATION, FPS, TungBuoc } from './TungBuoc';

export const Root: React.FC = () => (
  <Composition id="TungBuoc" component={TungBuoc} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
