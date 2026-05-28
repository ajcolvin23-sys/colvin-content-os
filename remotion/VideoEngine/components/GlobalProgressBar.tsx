/**
 * GlobalProgressBar
 *
 * Thin accent-colored bar at the very top of the frame.
 * Shows video progress 0% → 100% over the full duration.
 * Composited above all scenes — never blocked by scene content.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  accentColor: string;
  height?: number;
}

export const GlobalProgressBar: React.FC<Props> = ({
  accentColor,
  height = 4,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 200 }}>
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height,
          background: 'rgba(255,255,255,0.12)',
        }}
      />
      {/* Fill */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progress}%`,
          height,
          background: `linear-gradient(90deg, ${accentColor}99, ${accentColor})`,
          boxShadow: `0 0 8px ${accentColor}88`,
          transition: 'width 0.05s linear',
        }}
      />
    </AbsoluteFill>
  );
};
