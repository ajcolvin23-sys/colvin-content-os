/**
 * KeyboardHighlightScene.tsx
 * Shows the piano keyboard with active keys glowing.
 * "Hear it" — visual equivalent of playing the progression.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';
import { Keyboard } from './Keyboard';
import type { KeyHighlight } from '../data/musicTheoryAds';

interface KeyboardHighlightSceneProps {
  headline:         string;
  keys:             KeyHighlight[];
  localFrame:       number;
  durationInFrames: number;
}

export const KeyboardHighlightScene: React.FC<KeyboardHighlightSceneProps> = ({
  headline,
  keys,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const keyboardSpring = spring({
    frame: Math.max(0, localFrame - 14),
    fps,
    config: { damping: 22, stiffness: 100 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 14, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Animate "playing" through keys in sequence
  const playEvery = 20;
  const activeNoteIndex = Math.floor(localFrame / playEvery) % keys.length;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${musicTheme.colors.black} 0%, ${musicTheme.colors.darkPurple} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Purple ambient glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 400,
          background: `radial-gradient(ellipse, ${musicTheme.colors.gold}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 52,
          height: '100%',
          justifyContent: 'center',
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 48,
            fontWeight: 800,
            color: musicTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1.2px',
            textAlign: 'center',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -24}px)`,
          }}
        >
          {headline}
        </div>

        {/* Keyboard */}
        <div
          style={{
            opacity: keyboardSpring,
            transform: `scale(${0.88 + keyboardSpring * 0.12})`,
          }}
        >
          <Keyboard
            highlights={keys.map((k, i) => ({
              ...k,
              active: i === activeNoteIndex && localFrame > 20,
            }))}
            localFrame={localFrame}
            width={960}
            height={240}
          />
        </div>

        {/* Key labels row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
            opacity: keyboardSpring * 0.9,
          }}
        >
          {keys.map((k, i) => (
            <div
              key={k.note}
              style={{
                fontFamily: musicTheme.fonts.heading,
                fontSize: 32,
                fontWeight: 700,
                color: i === activeNoteIndex && localFrame > 20
                  ? musicTheme.colors.gold
                  : musicTheme.colors.gray,
                transition: 'all 0s',
                letterSpacing: '-0.5px',
              }}
            >
              {k.note}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
