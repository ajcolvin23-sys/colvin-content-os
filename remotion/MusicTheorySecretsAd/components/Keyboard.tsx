/**
 * Keyboard.tsx
 * A one-octave piano keyboard (C to B) with highlighted keys.
 * Active keys glow with their chord color.
 * White keys are wider; black keys overlay between specific whites.
 */
import React from 'react';
import { spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme, CHORD_COLORS } from '../theme/musicTheme';
import type { KeyHighlight } from '../data/musicTheoryAds';

interface KeyboardProps {
  highlights:  KeyHighlight[];
  localFrame:  number;
  width?:      number;
  height?:     number;
}

// White key note order
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Black key positions: [keyAfterIndex, note]
const BLACK_KEYS: Array<{ afterWhite: number; note: string }> = [
  { afterWhite: 0, note: 'C#' },
  { afterWhite: 1, note: 'D#' },
  // no black between E and F
  { afterWhite: 3, note: 'F#' },
  { afterWhite: 4, note: 'G#' },
  { afterWhite: 5, note: 'A#' },
];

export const Keyboard: React.FC<KeyboardProps> = ({
  highlights,
  localFrame,
  width = 900,
  height = 220,
}) => {
  const { fps } = useVideoConfig();

  const highlightMap = new Map(highlights.map(h => [h.note, h]));
  const NUMERALS_FOR_COLOR: Record<string, string> = {
    C: 'C', G: 'G', A: 'Am', F: 'F',
  };

  const wKeyWidth = width / 7;
  const bKeyWidth = wKeyWidth * 0.55;
  const bKeyHeight = height * 0.62;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 120 },
  });

  // Stagger activations across frame window
  const activateDelay = 12;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px)`,
      }}
    >
      {/* White keys */}
      {WHITE_KEYS.map((note, i) => {
        const hl = highlightMap.get(note);
        const isActive = !!hl;
        const activateAt = isActive
          ? highlights.findIndex(h => h.note === note) * activateDelay
          : 0;
        const relFrame = Math.max(0, localFrame - activateAt);

        const keyGlow = isActive
          ? spring({ frame: relFrame, fps, config: { damping: 14, stiffness: 200 } })
          : 0;

        const chordKey = NUMERALS_FOR_COLOR[note] ?? note;
        const color = isActive
          ? CHORD_COLORS[chordKey as keyof typeof CHORD_COLORS] ?? musicTheme.colors.gold
          : '#FFFFFF';

        return (
          <div
            key={note}
            style={{
              position: 'absolute',
              left: i * wKeyWidth + 1,
              top: 0,
              width: wKeyWidth - 2,
              height,
              background: isActive
                ? `linear-gradient(180deg, ${color}30 0%, ${color}18 60%, white 100%)`
                : '#F4F0EC',
              borderRadius: '0 0 10px 10px',
              border: isActive
                ? `2px solid ${color}90`
                : '1px solid #CCC',
              boxShadow: isActive
                ? `0 0 20px ${color}60, inset 0 -4px 8px ${color}20`
                : '0 4px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 14,
              transition: 'all 0s',
              transform: `scale(${1 + keyGlow * 0.02})`,
            }}
          >
            {isActive && hl && (
              <div
                style={{
                  fontFamily: musicTheme.fonts.heading,
                  fontSize: 22,
                  fontWeight: 900,
                  color,
                  opacity: keyGlow,
                  textShadow: `0 0 8px ${color}`,
                  lineHeight: 1,
                }}
              >
                {hl.numeral ?? note}
              </div>
            )}
          </div>
        );
      })}

      {/* Black keys */}
      {BLACK_KEYS.map(({ afterWhite, note }) => (
        <div
          key={note}
          style={{
            position: 'absolute',
            left: (afterWhite + 1) * wKeyWidth - bKeyWidth / 2,
            top: 0,
            width: bKeyWidth,
            height: bKeyHeight,
            background: 'linear-gradient(180deg, #2A2A2A 0%, #111 100%)',
            borderRadius: '0 0 6px 6px',
            border: '1px solid #444',
            zIndex: 2,
            boxShadow: '2px 4px 8px rgba(0,0,0,0.5)',
          }}
        />
      ))}
    </div>
  );
};
