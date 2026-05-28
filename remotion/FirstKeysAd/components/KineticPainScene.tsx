/**
 * KineticPainScene — 0:03–0:07
 *
 * Lines arrive word-by-word with staggered springs.
 * No photo — pure dark gradient creates visual contrast from hook.
 * Last line is gold to hint at the turn coming.
 * Each line separated by 22 frames (0.73s) to give the viewer time to read.
 */
import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { KineticLine } from './KineticLine';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  lines: string[];
  localFrame: number;
  durationInFrames: number;
}

export const KineticPainScene: React.FC<Props> = ({ lines, localFrame }) => {
  const fadeIn = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Stagger: each line fires 22 frames after the previous
  const lineStartFrames = lines.map((_, i) => i * 22);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>

      {/* Dark pressure gradient — intentionally no photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${firstKeysTheme.colors.navyDark} 0%, #160808 100%)`,
        }}
      />

      {/* Cold blue overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(18, 35, 75, 0.28)',
        }}
      />

      {/* Lines — vertically centered, safe horizontal margins */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {lines.map((line, i) => (
          <KineticLine
            key={i}
            text={line}
            startFrame={lineStartFrames[i]}
            fontSize={i === lines.length - 1 ? 60 : 72}
            color={
              i === lines.length - 1
                ? firstKeysTheme.colors.gold
                : firstKeysTheme.colors.white
            }
            fontWeight={900}
            staggerFrames={2}
          />
        ))}
      </div>

    </AbsoluteFill>
  );
};
