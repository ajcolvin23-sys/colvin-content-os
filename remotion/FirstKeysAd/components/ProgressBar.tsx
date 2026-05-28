/**
 * ProgressBar
 * Gold bar across the very top — shows total video progress.
 * Creates subconscious urgency and signals "this is short."
 */
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        background: 'rgba(255,255,255,0.12)',
        zIndex: 200,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: firstKeysTheme.colors.gold,
          borderRadius: '0 3px 3px 0',
          boxShadow: `0 0 8px ${firstKeysTheme.colors.gold}88`,
        }}
      />
    </div>
  );
};
