/**
 * GrantRevealScene — 0:07–0:12
 *
 * The emotional turn. Background warms from cold → gold.
 * Gold light burst expands as badge slides in.
 * Headline reveals the opportunity.
 * Soft CTA appears ("Check your options →").
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import { BrandBadge } from './BrandBadge';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  headline: string;
  badge?: string;
  cta?: string;
  imageUrl?: string;
  localFrame: number;
  durationInFrames: number;
}

export const GrantRevealScene: React.FC<Props> = ({
  headline,
  badge,
  cta,
  imageUrl,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const fadeIn   = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.14, 1.0], { extrapolateRight: 'clamp' });

  // Gold glow burst expanding from center
  const glowSpring = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 22, stiffness: 55 },
  });
  const glowSize    = interpolate(glowSpring, [0, 1], [0, 900]);
  const glowOpacity = interpolate(glowSpring, [0, 1], [0, 0.38]);

  // Headline springs up
  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const headlineY = interpolate(headlineSpring, [0, 1], [42, 0]);

  // Soft CTA
  const ctaSpring = spring({
    frame: Math.max(0, localFrame - 35),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>

      {/* Background */}
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
            background: `linear-gradient(160deg, ${firstKeysTheme.colors.navy}, ${firstKeysTheme.colors.green})`,
          }}
        />
      )}

      {/* Warm amber grade — hope */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(208, 136, 26, 0.24)' }} />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 38%, transparent 22%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      {/* Gold light burst */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width:  `${glowSize}px`,
          height: `${glowSize}px`,
          background: `radial-gradient(circle, rgba(242,184,75,${glowOpacity}) 0%, transparent 68%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: firstKeysTheme.safe.bottom + 40,
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
        }}
      >
        {badge && <BrandBadge label={badge} startFrame={18} />}

        <div
          style={{
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 62,
            fontWeight: 900,
            color: firstKeysTheme.colors.white,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginTop: 26,
            textShadow: '0 3px 18px rgba(0,0,0,0.7)',
            transform: `translateY(${headlineY}px)`,
            opacity: headlineSpring,
          }}
        >
          {headline}
        </div>

        {cta && (
          <div
            style={{
              marginTop: 28,
              fontFamily: firstKeysTheme.fonts.body,
              fontSize: 38,
              fontWeight: 700,
              color: firstKeysTheme.colors.gold,
              letterSpacing: '-0.5px',
              transform: `translateY(${(1 - ctaSpring) * 22}px)`,
              opacity: ctaSpring,
            }}
          >
            {cta}
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};
