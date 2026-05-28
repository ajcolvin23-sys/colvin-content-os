/**
 * KineticLine
 * Word-by-word spring entrance — each word falls from above with staggered timing.
 * This is what makes pain lines feel alive instead of PowerPoint.
 */
import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  text: string;
  startFrame: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  staggerFrames?: number;
}

export const KineticLine: React.FC<Props> = ({
  text,
  startFrame,
  fontSize = 70,
  color = firstKeysTheme.colors.white,
  fontWeight = 900,
  staggerFrames = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '16px', rowGap: '4px' }}>
      {words.map((word, i) => {
        const wordFrame = Math.max(0, frame - startFrame - i * staggerFrames);
        const s = spring({
          frame: wordFrame,
          fps,
          config: { damping: 14, stiffness: 200 },
        });
        return (
          <span
            key={i}
            style={{
              fontFamily: firstKeysTheme.fonts.heading,
              fontSize,
              fontWeight,
              color,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              display: 'inline-block',
              transform: `translateY(${(1 - s) * 44}px)`,
              opacity: s,
              textShadow: '0 2px 14px rgba(0,0,0,0.6)',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
