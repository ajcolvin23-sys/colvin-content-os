/**
 * MusicHookScene.tsx
 * The opening 3-second pattern interrupt.
 * Big, punchy headline — dark purple, gold glow.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface MusicHookSceneProps {
  headline:     string;
  subheadline?: string;
  localFrame:   number;
  durationInFrames: number;
}

export const MusicHookScene: React.FC<MusicHookSceneProps> = ({
  headline,
  subheadline,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 280 },
  });

  const headlineScale = interpolate(headlineSpring, [0, 1], [1.5, 1.0]);

  const subSpring = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 14, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${musicTheme.colors.darkPurple} 0%, ${musicTheme.colors.black} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Gold spotlight */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background: `radial-gradient(ellipse, ${musicTheme.colors.gold}28 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle music staff lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0, right: 0,
            top: `${38 + i * 3.5}%`,
            height: 1,
            background: `rgba(245,200,66,0.06)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 28,
          height: '100%',
        }}
      >
        {/* Brand chip */}
        <div
          style={{
            padding: '8px 20px',
            background: `${musicTheme.colors.gold}18`,
            border: `1px solid ${musicTheme.colors.gold}40`,
            borderRadius: 100,
            fontFamily: musicTheme.fonts.body,
            fontSize: 22,
            fontWeight: 700,
            color: musicTheme.colors.gold,
            letterSpacing: '0.5px',
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 20}px)`,
          }}
        >
          🎹 MUSIC THEORY SECRETS
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 84,
            fontWeight: 900,
            color: musicTheme.colors.white,
            lineHeight: 1.0,
            letterSpacing: '-3px',
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
              fontFamily: musicTheme.fonts.body,
              fontSize: 34,
              fontWeight: 500,
              color: musicTheme.colors.offWhite,
              lineHeight: 1.35,
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
