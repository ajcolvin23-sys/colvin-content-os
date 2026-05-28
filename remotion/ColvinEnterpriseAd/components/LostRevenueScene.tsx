/**
 * LostRevenueScene.tsx
 * Stats roll in one by one with dramatic red/amber highlights.
 * "Manual work is quietly killing growth."
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

interface LostRevenueSceneProps {
  headline:         string;
  statLines:        string[];
  localFrame:       number;
  durationInFrames: number;
}

export const LostRevenueScene: React.FC<LostRevenueSceneProps> = ({
  headline,
  statLines,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();
  const statSpacing = 22;

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colvinTheme.colors.navy} 0%, #0D0810 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Red warning glow */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 500,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.red}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${colvinTheme.safe.top}px ${colvinTheme.safe.left}px ${colvinTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 52,
            fontWeight: 800,
            color: colvinTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1.5px',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -24}px)`,
          }}
        >
          {headline}
        </div>

        {/* Stat lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {statLines.map((stat, i) => {
            const s = spring({
              frame: Math.max(0, localFrame - statSpacing * (i + 1)),
              fps,
              config: { damping: 16, stiffness: 140 },
            });

            const isLast = i === statLines.length - 1;

            return (
              <div
                key={stat}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 18,
                  opacity: s,
                  transform: `translateX(${(1 - s) * -40}px)`,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 44,
                    borderRadius: 4,
                    background: isLast ? colvinTheme.colors.electric : colvinTheme.colors.red,
                    flexShrink: 0,
                    marginTop: 4,
                    boxShadow: isLast
                      ? `0 0 12px ${colvinTheme.colors.electric}`
                      : `0 0 12px ${colvinTheme.colors.red}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: colvinTheme.fonts.body,
                    fontSize: 34,
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? colvinTheme.colors.cyan : colvinTheme.colors.offWhite,
                    lineHeight: 1.35,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {stat}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
