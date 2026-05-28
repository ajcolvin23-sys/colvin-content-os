/**
 * MusicPainScene.tsx
 * Kinetic word-by-word frustration lines.
 * Coral accent for emotional resonance.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface MusicPainSceneProps {
  lines:            string[];
  localFrame:       number;
  durationInFrames: number;
}

export const MusicPainScene: React.FC<MusicPainSceneProps> = ({
  lines,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();
  const lineSpacing = Math.floor(durationInFrames / (lines.length + 1));

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 12, durationInFrames - 2],
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
      {/* Coral glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${musicTheme.colors.coral}14 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {lines.map((line, i) => {
          const words = line.split(' ');
          const lineStart = lineSpacing * (i + 0.5);
          const staggerFrames = 5;
          const isLast = i === lines.length - 1;

          return (
            <div
              key={line}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0 12px',
                alignItems: 'center',
              }}
            >
              {words.map((word, wi) => {
                const s = spring({
                  frame: Math.max(0, localFrame - lineStart - wi * staggerFrames),
                  fps,
                  config: { damping: 14, stiffness: 200 },
                });
                return (
                  <div
                    key={`${line}-${wi}`}
                    style={{
                      fontFamily: musicTheme.fonts.heading,
                      fontSize: isLast ? 54 : 48,
                      fontWeight: isLast ? 800 : 600,
                      color: isLast ? musicTheme.colors.gold : musicTheme.colors.offWhite,
                      opacity: s,
                      transform: `translateY(${(1 - s) * 44}px)`,
                      lineHeight: 1.15,
                      letterSpacing: isLast ? '-1.5px' : '-0.5px',
                    }}
                  >
                    {word}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
