/**
 * SafeZone
 *
 * 9:16 mobile safe zone container.
 * Enforces TikTok/Reels/Shorts safe margins so text is never
 * cut off by UI overlays, captions, or device notches.
 *
 * Safe zones:
 *   Top:    120px — avoids status bar + platform UI
 *   Bottom: 240px — avoids CTA overlay + caption area
 *   Left:   56px
 *   Right:  56px
 */
import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Extra top padding beyond the safe zone default */
  topOffset?: number;
  /** Extra bottom padding beyond the safe zone default */
  bottomOffset?: number;
  style?: React.CSSProperties;
}

export const SafeZone: React.FC<Props> = ({
  children,
  topOffset = 0,
  bottomOffset = 0,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 120 + topOffset,
      bottom: 240 + bottomOffset,
      left: 56,
      right: 56,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);
