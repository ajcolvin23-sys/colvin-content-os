/**
 * CinematicGrain
 *
 * Subtle animated film grain overlay. Adds cinematic texture without
 * distracting from the content. Rendered as a CSS-animated SVG noise pattern.
 *
 * Opacity: 3–5% — barely visible but noticeably improves perceived quality.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface Props {
  opacity?: number;  // 0–1, default 0.04
}

export const CinematicGrain: React.FC<Props> = ({ opacity = 0.04 }) => {
  const frame = useCurrentFrame();
  // Shift the noise pattern every frame for animated grain
  const seed = (frame * 37) % 1000;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
