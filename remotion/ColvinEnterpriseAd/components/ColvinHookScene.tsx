/**
 * ColvinHookScene.tsx
 * 3-second pattern-interrupt hook.
 * Headline punches in large, subheadline slides up after.
 * Dark premium tech background with subtle grid.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

interface ColvinHookSceneProps {
  headline:     string;
  subheadline?: string;
  localFrame:   number;
  durationInFrames: number;
}

export const ColvinHookScene: React.FC<ColvinHookSceneProps> = ({
  headline,
  subheadline,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 260 },
  });

  const headlineScale = interpolate(headlineSpring, [0, 1], [1.4, 1.0]);

  const subSpring = spring({
    frame: Math.max(0, localFrame - 12),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  // Exit fade
  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 15, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colvinTheme.colors.navyMid} 0%, ${colvinTheme.colors.navy} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `linear-gradient(rgba(54,184,255,0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(54,184,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          pointerEvents: 'none',
        }}
      />

      {/* Electric top glow */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 300,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.electric}28 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${colvinTheme.safe.top}px ${colvinTheme.safe.left}px ${colvinTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
        }}
      >
        {/* Brand chip */}
        <div
          style={{
            padding: '8px 20px',
            background: `${colvinTheme.colors.electric}18`,
            border: `1px solid ${colvinTheme.colors.electric}40`,
            borderRadius: 100,
            fontFamily: colvinTheme.fonts.body,
            fontSize: 22,
            fontWeight: 600,
            color: colvinTheme.colors.electric,
            letterSpacing: '0.5px',
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 20}px)`,
          }}
        >
          COLVIN ENTERPRISES
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 72,
            fontWeight: 800,
            color: colvinTheme.colors.white,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            transform: `scale(${headlineScale})`,
            opacity: headlineSpring,
          }}
        >
          {headline}
        </div>

        {/* Subheadline */}
        {subheadline && (
          <div
            style={{
              fontFamily: colvinTheme.fonts.body,
              fontSize: 36,
              fontWeight: 500,
              color: colvinTheme.colors.cyan,
              lineHeight: 1.3,
              opacity: subSpring,
              transform: `translateY(${(1 - subSpring) * 32}px)`,
            }}
          >
            {subheadline}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
