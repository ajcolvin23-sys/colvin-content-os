/**
 * LightBeam — diagonal or vertical gold/blue light sweep.
 * Animates via interpolate only — no CSS transitions.
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export interface LightBeamProps {
  color?:      string;   // beam color hex
  angle?:      number;   // rotation degrees (0 = vertical)
  width?:      number;   // beam width px
  opacity?:    number;   // master opacity multiplier 0-1
  /** Frame at which the beam sweep begins */
  startFrame?: number;
  /** Horizontal center position (0–100 %) */
  xPercent?:   number;
}

export const LightBeam: React.FC<LightBeamProps> = ({
  color      = '#D4AF37',
  angle      = -25,
  width      = 140,
  opacity    = 1,
  startFrame = 0,
  xPercent   = 50,
}) => {
  const frame = useCurrentFrame();
  const lf    = frame - startFrame;

  // Sweep in then hold at lower opacity
  const sweep = interpolate(lf, [0, 20], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const beamOpacity = interpolate(
    sweep,
    [0, 0.4, 1],
    [0, 0.55, 0.32],
  ) * opacity;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Core beam */}
      <div
        style={{
          position:  'absolute',
          left:      `${xPercent}%`,
          top:       '-20%',
          width:     width,
          height:    '140%',
          background: `linear-gradient(
            to bottom,
            transparent       0%,
            ${color}55       15%,
            ${color}2A       50%,
            ${color}55       85%,
            transparent      100%
          )`,
          transform:  `translateX(-50%) rotate(${angle}deg)`,
          opacity:    beamOpacity,
          filter:     `blur(${width * 0.12}px)`,
        }}
      />
      {/* Thin bright center line */}
      <div
        style={{
          position:  'absolute',
          left:      `${xPercent}%`,
          top:       '-20%',
          width:     Math.max(2, width * 0.06),
          height:    '140%',
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            ${color}CC 30%,
            ${color}88 50%,
            ${color}CC 70%,
            transparent 100%
          )`,
          transform:  `translateX(-50%) rotate(${angle}deg)`,
          opacity:    beamOpacity * 1.4,
          filter:     `blur(1px)`,
        }}
      />
    </AbsoluteFill>
  );
};
