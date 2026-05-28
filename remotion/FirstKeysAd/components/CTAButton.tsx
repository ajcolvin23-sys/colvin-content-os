/**
 * CTAButton
 * Gold pill button with spring entrance + continuous subtle pulse.
 * Pulse is intentionally subtle — just enough to draw the eye.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  label: string;
  startFrame?: number;
}

export const CTAButton: React.FC<Props> = ({ label, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Subtle pulse after entrance — sin wave, very gentle
  const pulseFrame = Math.max(0, frame - startFrame - 20);
  const pulse = 1 + Math.sin(pulseFrame * 0.13) * 0.022;

  return (
    <div
      style={{
        display: 'inline-block',
        background: firstKeysTheme.colors.gold,
        color: firstKeysTheme.colors.navy,
        fontFamily: firstKeysTheme.fonts.heading,
        fontSize: 42,
        fontWeight: 800,
        padding: '26px 60px',
        borderRadius: 18,
        letterSpacing: '-0.5px',
        transform: `scale(${entrance * pulse})`,
        transformOrigin: 'center center',
        opacity: entrance,
        boxShadow: `0 10px 40px rgba(242,184,75,0.45), 0 2px 8px rgba(0,0,0,0.3)`,
      }}
    >
      {label}
    </div>
  );
};
