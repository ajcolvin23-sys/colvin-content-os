/**
 * ProgressionArrow.tsx
 * Animated arrow connecting chord cards in sequence.
 * Draws in from left with a line that grows across.
 */
import React from 'react';
import { interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface ProgressionArrowProps {
  localFrame:  number;
  startAt:     number;
  totalFrames: number;
  color?:      string;
}

export const ProgressionArrow: React.FC<ProgressionArrowProps> = ({
  localFrame,
  startAt,
  totalFrames,
  color = musicTheme.colors.gold,
}) => {
  const progress = interpolate(
    localFrame,
    [startAt, startAt + 18],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 32,
        flexShrink: 0,
      }}
    >
      {/* Line */}
      <div
        style={{
          height: 2,
          width: `${progress * 60}%`,
          background: color,
          boxShadow: `0 0 8px ${color}`,
          borderRadius: 1,
        }}
      />
      {/* Arrowhead */}
      {progress > 0.7 && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: `8px solid ${color}`,
            opacity: (progress - 0.7) / 0.3,
            filter: `drop-shadow(0 0 4px ${color})`,
            marginLeft: -1,
          }}
        />
      )}
    </div>
  );
};
