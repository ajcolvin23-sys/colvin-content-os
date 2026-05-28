import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

export const ColvinProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        background: 'rgba(255,255,255,0.12)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${colvinTheme.colors.electric}, ${colvinTheme.colors.cyan})`,
          boxShadow: `0 0 10px ${colvinTheme.colors.electric}`,
          borderRadius: '0 2px 2px 0',
          transition: 'width 0s',
        }}
      />
    </div>
  );
};
