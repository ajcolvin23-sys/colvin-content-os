/**
 * LightSweep
 *
 * A bright gradient that sweeps across the image from left to right,
 * simulating a cinematic lens flare or light pass.
 *
 * Triggers once at scene start, fades quickly.
 * Adds a premium feel without distracting from the content.
 */
import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';

interface Props {
  localFrame: number;
  sweepColor?: string;   // defaults to white
  startFrame?: number;   // frame to begin the sweep
  duration?: number;     // frames the sweep takes to cross
}

export const LightSweep: React.FC<Props> = ({
  localFrame,
  sweepColor = 'rgba(255,255,255,0.18)',
  startFrame = 2,
  duration = 20,
}) => {
  const progress = interpolate(
    localFrame,
    [startFrame, startFrame + duration],
    [-120, 140],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = interpolate(
    localFrame,
    [startFrame, startFrame + duration * 0.3, startFrame + duration],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          background: `linear-gradient(
            105deg,
            transparent ${progress - 20}%,
            ${sweepColor} ${progress}%,
            transparent ${progress + 20}%
          )`,
        }}
      />
    </AbsoluteFill>
  );
};
