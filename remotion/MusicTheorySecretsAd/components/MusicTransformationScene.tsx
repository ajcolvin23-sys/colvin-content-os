/**
 * MusicTransformationScene.tsx
 * The "you can do this" emotional payoff.
 * Gold sunrise glow + 🎹 icon bounce.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface MusicTransformationSceneProps {
  headline:         string;
  subheadline?:     string;
  localFrame:       number;
  durationInFrames: number;
}

export const MusicTransformationScene: React.FC<MusicTransformationSceneProps> = ({
  headline,
  subheadline,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  // Rising glow
  const glowSize = spring({
    frame: localFrame,
    fps,
    config: { damping: 28, stiffness: 60 },
  }) * 900;

  const iconSpring = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 9, stiffness: 200 },
  });

  const headlineSpring = spring({
    frame: Math.max(0, localFrame - 18),
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const subSpring = spring({
    frame: Math.max(0, localFrame - 28),
    fps,
    config: { damping: 20, stiffness: 120 },
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
        background: musicTheme.colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Rising gold sunrise */}
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: glowSize,
          height: glowSize,
          background: `radial-gradient(circle, ${musicTheme.colors.gold}35 0%, ${musicTheme.colors.coral}12 40%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 36,
          height: '100%',
        }}
      >
        {/* Piano icon */}
        <div
          style={{
            fontSize: 96,
            opacity: iconSpring,
            transform: `scale(${0.3 + iconSpring * 0.7}) rotate(${(1 - iconSpring) * -8}deg)`,
            filter: `drop-shadow(0 0 20px ${musicTheme.colors.gold}80)`,
          }}
        >
          🎹
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 60,
            fontWeight: 800,
            color: musicTheme.colors.white,
            lineHeight: 1.15,
            letterSpacing: '-2px',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * 30}px)`,
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
              color: musicTheme.colors.gold,
              lineHeight: 1.35,
              opacity: subSpring,
              transform: `translateY(${(1 - subSpring) * 24}px)`,
            }}
          >
            {subheadline}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
