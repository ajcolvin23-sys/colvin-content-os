/**
 * BrandBadge
 * Gold-bordered pill badge — slides up on entrance.
 * Used for "Down Payment Assistance", "Marion County Program", etc.
 */
import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  label: string;
  startFrame?: number;
  icon?: string;
}

export const BrandBadge: React.FC<Props> = ({ label, startFrame = 0, icon = '🏠' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: `${firstKeysTheme.colors.gold}1E`,
        border: `2.5px solid ${firstKeysTheme.colors.gold}`,
        borderRadius: 100,
        padding: '12px 30px',
        fontFamily: firstKeysTheme.fonts.body,
        fontSize: 26,
        fontWeight: 700,
        color: firstKeysTheme.colors.gold,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        transform: `translateY(${(1 - entrance) * 32}px)`,
        opacity: entrance,
      }}
    >
      {icon} {label}
    </div>
  );
};
