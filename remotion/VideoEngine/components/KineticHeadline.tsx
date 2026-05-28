/**
 * KineticHeadline
 *
 * Word-by-word spring reveal. Each word springs in with a staggered delay,
 * creating the kinetic typography feel of a high-retention short-form ad.
 *
 * Features:
 * - Word-by-word or character-by-character reveal
 * - Spring-based entrance (not linear easing)
 * - Optional emphasis word highlighted in accent color
 * - Optional glow on the emphasis word
 * - Supports size presets: 'xl' | 'lg' | 'md' | 'sm'
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';

interface Props {
  text: string;
  localFrame: number;
  fontFamily?: string;
  color?: string;
  accentColor?: string;
  emphasis?: string;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  textAlign?: 'left' | 'center' | 'right';
  staggerFrames?: number; // frames between each word entrance
  startDelay?: number;    // frames before first word appears
  glowEmphasis?: boolean;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xl: { fontSize: 84, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.05 },
  lg: { fontSize: 68, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1 },
  md: { fontSize: 52, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15 },
  sm: { fontSize: 38, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3 },
};

export const KineticHeadline: React.FC<Props> = ({
  text,
  localFrame,
  fontFamily = 'Inter',
  color = '#FFFFFF',
  accentColor = '#4FC3F7',
  emphasis,
  size = 'lg',
  textAlign = 'center',
  staggerFrames = 4,
  startDelay = 0,
  glowEmphasis = true,
  style,
}) => {
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const { fontSize, fontWeight, letterSpacing, lineHeight } = SIZE_MAP[size];

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        color,
        textAlign,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wordFrame = Math.max(0, localFrame - startDelay - i * staggerFrames);
        const wordSpring = spring({
          frame: wordFrame,
          fps,
          config: { damping: 18, stiffness: 200, mass: 0.6 },
        });
        const wordOpacity = Math.min(wordSpring, 1);
        const wordY = (1 - wordSpring) * 28;

        const isEmphasis = emphasis && word.replace(/[.,!?]/g, '') === emphasis.replace(/[.,!?]/g, '');

        return (
          <span key={i} style={{ display: 'inline-block', marginRight: '0.25em' }}>
            <span
              style={{
                display: 'inline-block',
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                color: isEmphasis ? accentColor : color,
                ...(isEmphasis && glowEmphasis
                  ? { textShadow: `0 0 40px ${accentColor}88, 0 0 80px ${accentColor}44` }
                  : {}),
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};
