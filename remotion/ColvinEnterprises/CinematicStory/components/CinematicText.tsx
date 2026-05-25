/**
 * CinematicText — reusable kinetic typography component.
 *
 * Supports:
 *  - Word-by-word or line-by-line spring entrance
 *  - Blur-to-sharp reveal
 *  - Optional gold highlight on a specific word
 *  - Optional impact scale on entrance
 *
 * ⚠ No CSS transitions — all animation via interpolate / spring.
 */

import React from 'react';
import { useVideoConfig, spring, interpolate } from 'remotion';
import { FONT } from '../theme';

export interface CinematicTextProps {
  /** Text lines/words to render. Each string is animated as one unit. */
  lines: string[];
  /** Frame at which the first word begins its entrance */
  startFrame?: number;
  /** Frames between each word/line entrance */
  staggerFrames?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  /** Index of a word/line to render in gold */
  highlightIndex?: number;
  highlightColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  /** Blur-to-sharp reveal on entrance */
  blurReveal?: boolean;
  /** Scale punch on entrance (1 = no scale effect) */
  impactScale?: number;
  /** Extra outer style for the container div */
  containerStyle?: React.CSSProperties;
  /** localFrame from parent — pass useCurrentFrame() - sequenceStart */
  localFrame: number;
}

export const CinematicText: React.FC<CinematicTextProps> = ({
  lines,
  startFrame = 0,
  staggerFrames = 10,
  fontSize = 72,
  fontWeight = 900,
  color = '#FFFFFF',
  highlightIndex,
  highlightColor = '#D4AF37',
  textAlign = 'center',
  blurReveal = false,
  impactScale = 1,
  containerStyle = {},
  localFrame,
}) => {
  const { fps } = useVideoConfig();

  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        gap: '0.18em',
        ...containerStyle,
      }}
    >
      {lines.map((line, i) => {
        const wordStart = startFrame + i * staggerFrames;
        const p = spring({
          fps,
          frame: Math.max(0, localFrame - wordStart),
          config: { damping: 20, stiffness: 120, mass: 0.6 },
        });

        const blur  = blurReveal ? interpolate(p, [0, 1], [10, 0]) : 0;
        const scale = impactScale !== 1
          ? interpolate(p, [0, 0.6, 1], [impactScale * 0.85, impactScale * 1.04, 1])
          : 1;

        const lineColor = i === highlightIndex ? highlightColor : color;

        return (
          <div
            key={i}
            style={{
              fontFamily:  FONT,
              fontSize,
              fontWeight,
              lineHeight:  1.1,
              color:       lineColor,
              opacity:     p,
              transform:   `translateY(${interpolate(p, [0, 1], [22, 0])}px) scale(${scale})`,
              filter:      blur > 0 ? `blur(${blur}px)` : undefined,
              display:     'block',
              textAlign,
              whiteSpace:  'pre-line',
              letterSpacing: fontWeight >= 800 ? '-0.02em' : undefined,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
