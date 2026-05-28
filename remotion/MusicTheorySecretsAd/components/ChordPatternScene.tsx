/**
 * ChordPatternScene.tsx
 * The core micro-lesson reveal: 4 chord cards + progression arrows.
 * Cards enter one-by-one with stagger. Badge slides up at the top.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme, CHORD_COLORS } from '../theme/musicTheme';
import { ChordCard } from './ChordCard';
import { ProgressionArrow } from './ProgressionArrow';
import type { ChordCard as ChordCardType } from '../data/musicTheoryAds';

interface ChordPatternSceneProps {
  headline:         string;
  chords:           ChordCardType[];
  badge?:           string;
  localFrame:       number;
  durationInFrames: number;
}

const CARD_STAGGER = 22; // frames between each card entrance

export const ChordPatternScene: React.FC<ChordPatternSceneProps> = ({
  headline,
  chords,
  badge,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 14, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Which chord is "active" (playing right now)
  const activeIndex = Math.min(
    Math.floor((localFrame - 30) / CARD_STAGGER),
    chords.length - 1,
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${musicTheme.colors.darkPurple} 0%, ${musicTheme.colors.black} 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Gold ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 600,
          background: `radial-gradient(ellipse, ${musicTheme.colors.gold}14 0%, transparent 65%)`,
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
        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 44,
            fontWeight: 800,
            color: musicTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1px',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -20}px)`,
          }}
        >
          {headline}
        </div>

        {/* Chord cards row with arrows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 0,
          }}
        >
          {chords.map((chord, i) => (
            <React.Fragment key={chord.chord}>
              <ChordCard
                chord={chord}
                frame={localFrame}
                startAt={i * CARD_STAGGER + 16}
                isActive={i === activeIndex}
              />
              {i < chords.length - 1 && (
                <ProgressionArrow
                  localFrame={localFrame}
                  startAt={i * CARD_STAGGER + 28}
                  totalFrames={durationInFrames}
                  color={
                    CHORD_COLORS[chord.chord as keyof typeof CHORD_COLORS]
                    ?? musicTheme.colors.gold
                  }
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Badge */}
        {badge && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '10px 24px',
              background: `${musicTheme.colors.gold}18`,
              border: `1px solid ${musicTheme.colors.gold}50`,
              borderRadius: 100,
              fontFamily: musicTheme.fonts.heading,
              fontSize: 28,
              fontWeight: 700,
              color: musicTheme.colors.gold,
              letterSpacing: '0.5px',
              opacity: badgeSpring,
              transform: `translateY(${(1 - badgeSpring) * 20}px)`,
            }}
          >
            {badge}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
