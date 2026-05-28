/**
 * NumberSystemScene.tsx
 * Teaches the Nashville Number System concept.
 * Lines reveal one-by-one with left-to-right slide.
 * Badge labels the concept name.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface NumberSystemSceneProps {
  headline:         string;
  lines:            string[];
  badge?:           string;
  localFrame:       number;
  durationInFrames: number;
}

export const NumberSystemScene: React.FC<NumberSystemSceneProps> = ({
  headline,
  lines,
  badge,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();
  const lineSpacing = 22;

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: { damping: 20, stiffness: 140 },
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
        opacity: exitOpacity,
      }}
    >
      {/* Cyan accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background: `radial-gradient(ellipse, ${musicTheme.colors.cyan}14 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          height: '100%',
          justifyContent: 'center',
        }}
      >
        {/* Badge */}
        {badge && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '8px 20px',
              background: `${musicTheme.colors.cyan}18`,
              border: `1px solid ${musicTheme.colors.cyan}40`,
              borderRadius: 100,
              fontFamily: musicTheme.fonts.body,
              fontSize: 22,
              fontWeight: 700,
              color: musicTheme.colors.cyan,
              letterSpacing: '0.5px',
              opacity: badgeSpring,
              transform: `translateY(${(1 - badgeSpring) * 16}px)`,
            }}
          >
            🎵 {badge}
          </div>
        )}

        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 46,
            fontWeight: 800,
            color: musicTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1.2px',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -20}px)`,
          }}
        >
          {headline}
        </div>

        {/* Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lines.map((line, i) => {
            const s = spring({
              frame: Math.max(0, localFrame - lineSpacing * (i + 1)),
              fps,
              config: { damping: 18, stiffness: 160 },
            });

            // Number part (before space) gets accent color
            const parts = line.match(/^(\S+)\s*(.*)$/);
            const numPart = parts?.[1] ?? '';
            const textPart = parts?.[2] ?? '';

            return (
              <div
                key={line}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  opacity: s,
                  transform: `translateX(${(1 - s) * -40}px)`,
                }}
              >
                {/* Number badge */}
                <div
                  style={{
                    minWidth: 52,
                    padding: '6px 12px',
                    background: `${musicTheme.colors.gold}20`,
                    border: `1px solid ${musicTheme.colors.gold}50`,
                    borderRadius: 8,
                    fontFamily: musicTheme.fonts.heading,
                    fontSize: 26,
                    fontWeight: 900,
                    color: musicTheme.colors.gold,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {numPart}
                </div>
                <div
                  style={{
                    fontFamily: musicTheme.fonts.body,
                    fontSize: 32,
                    fontWeight: 500,
                    color: musicTheme.colors.offWhite,
                    lineHeight: 1.3,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {textPart}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
