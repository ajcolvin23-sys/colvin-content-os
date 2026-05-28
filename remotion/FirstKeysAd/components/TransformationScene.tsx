/**
 * TransformationScene — 0:17–0:22
 *
 * The emotional peak. Gold glow expands. Key icon bounces in.
 * Slow Ken Burns. Warm grade.
 * This is where the viewer pictures themselves.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  headline: string;
  imageUrl?: string;
  localFrame: number;
  durationInFrames: number;
}

export const TransformationScene: React.FC<Props> = ({
  headline,
  imageUrl,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const fadeIn   = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.15, 1.0], { extrapolateRight: 'clamp' });

  // Gold glow that expands like sunrise
  const glowSpring = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: { damping: 20, stiffness: 55 },
  });
  const glowSize    = interpolate(glowSpring, [0, 1], [0, 1100]);
  const glowOpacity = interpolate(glowSpring, [0, 1], [0, 0.52]);

  // Key icon bounces in
  const keySpring = spring({
    frame: Math.max(0, localFrame - 12),
    fps,
    config: { damping: 9, stiffness: 180 },
  });

  // Headline
  const headlineSpring = spring({
    frame: Math.max(0, localFrame - 4),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>

      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            position: 'absolute',
            inset: '-5%',
            width: '110%',
            height: '110%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transform: `scale(${imgScale})`,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, ${firstKeysTheme.colors.green}, ${firstKeysTheme.colors.navy})`,
          }}
        />
      )}

      {/* Gold sunrise burst */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width:  `${glowSize}px`,
          height: `${glowSize}px`,
          background: `radial-gradient(circle, rgba(242,184,75,${glowOpacity}) 0%, transparent 65%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Warm amber grade */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(208, 136, 26, 0.22)' }} />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 38%, transparent 28%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.44) 46%, transparent 70%)',
        }}
      />

      {/* Key icon */}
      <div
        style={{
          position: 'absolute',
          bottom: firstKeysTheme.safe.bottom + 300,
          left: firstKeysTheme.safe.left,
          fontSize: 84,
          transform: `scale(${keySpring})`,
          opacity: keySpring,
        }}
      >
        🗝️
      </div>

      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          bottom: firstKeysTheme.safe.bottom + 48,
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
          fontFamily: firstKeysTheme.fonts.heading,
          fontSize: 66,
          fontWeight: 900,
          color: firstKeysTheme.colors.white,
          lineHeight: 1.15,
          letterSpacing: '-2px',
          textShadow: '0 3px 22px rgba(0,0,0,0.65)',
          transform: `translateY(${(1 - headlineSpring) * 36}px)`,
          opacity: headlineSpring,
        }}
      >
        {headline}
      </div>

    </AbsoluteFill>
  );
};
