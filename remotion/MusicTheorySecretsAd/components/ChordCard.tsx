/**
 * ChordCard.tsx
 * A single chord card that reveals with a spring entrance.
 * Shows chord name, numeral, and emotional description.
 * Color-coded per chord (gold=1, cyan=5, coral=6, green=4).
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';
import { musicTheme, CHORD_COLORS } from '../theme/musicTheme';
import type { ChordCard as ChordCardType } from '../data/musicTheoryAds';

interface ChordCardProps {
  chord:      ChordCardType;
  frame:      number;
  startAt:    number;
  isActive?:  boolean;  // currently playing
}

export const ChordCard: React.FC<ChordCardProps> = ({ chord, frame, startAt, isActive }) => {
  const { fps } = useVideoConfig();
  const relFrame = Math.max(0, frame - startAt);

  const entrance = spring({
    frame: relFrame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });

  const activePulse = isActive
    ? spring({
        frame: relFrame,
        fps,
        config: { damping: 8, stiffness: 250 },
      })
    : 0;

  const color = CHORD_COLORS[chord.chord as keyof typeof CHORD_COLORS] ?? musicTheme.colors.gold;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: musicTheme.colors.purple,
        border: `2px solid ${color}${isActive ? 'FF' : '60'}`,
        borderRadius: 16,
        padding: '20px 16px',
        flex: 1,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 60}px) scale(${0.85 + entrance * 0.15 + activePulse * 0.04})`,
        boxShadow: isActive
          ? `0 0 30px ${color}50, 0 4px 20px rgba(0,0,0,0.5)`
          : `0 4px 16px rgba(0,0,0,0.4)`,
        transition: 'all 0s',
      }}
    >
      {/* Numeral */}
      <div
        style={{
          fontFamily: musicTheme.fonts.heading,
          fontSize: 28,
          fontWeight: 900,
          color,
          opacity: 0.9,
        }}
      >
        {chord.numeral}
      </div>

      {/* Chord name */}
      <div
        style={{
          fontFamily: musicTheme.fonts.heading,
          fontSize: 42,
          fontWeight: 800,
          color: musicTheme.colors.white,
          lineHeight: 1,
          letterSpacing: '-1px',
        }}
      >
        {chord.chord}
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: musicTheme.fonts.body,
          fontSize: 20,
          fontWeight: 500,
          color,
          opacity: 0.85,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {chord.description}
      </div>

      {/* Active glow dot */}
      {isActive && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}`,
            opacity: 0.8 + Math.sin(frame * 0.2) * 0.2,
          }}
        />
      )}
    </div>
  );
};
