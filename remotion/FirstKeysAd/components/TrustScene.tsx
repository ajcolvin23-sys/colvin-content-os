/**
 * TrustScene — 0:12–0:17
 *
 * Local credibility. "First Keys Indy" brand name.
 * "📍 Marion County Program" badge establishes hyperlocal trust.
 * Background: local family or house photo (warm grade).
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

export const TrustScene: React.FC<Props> = ({
  headline,
  imageUrl,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const fadeIn   = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.12, 1.0], { extrapolateRight: 'clamp' });

  const headlineSpring = spring({
    frame: Math.max(0, localFrame - 5),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const localBadgeSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const brandSpring = spring({
    frame: Math.max(0, localFrame - 25),
    fps,
    config: { damping: 14, stiffness: 90 },
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
            objectPosition: 'center',
            transform: `scale(${imgScale})`,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, ${firstKeysTheme.colors.navy}, ${firstKeysTheme.colors.navyDark})`,
          }}
        />
      )}

      {/* Warm grade */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(198, 128, 28, 0.20)' }} />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 42%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: firstKeysTheme.safe.bottom + 32,
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
        }}
      >
        {/* Marion County badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: `${firstKeysTheme.colors.green}2A`,
            border: `2px solid ${firstKeysTheme.colors.green}`,
            borderRadius: 100,
            padding: '10px 24px',
            marginBottom: 22,
            fontFamily: firstKeysTheme.fonts.body,
            fontSize: 24,
            fontWeight: 700,
            color: firstKeysTheme.colors.greenLight,
            letterSpacing: '0.5px',
            transform: `translateY(${(1 - localBadgeSpring) * 24}px)`,
            opacity: localBadgeSpring,
          }}
        >
          📍 Marion County Program
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 52,
            fontWeight: 800,
            color: firstKeysTheme.colors.white,
            lineHeight: 1.25,
            letterSpacing: '-1px',
            textShadow: '0 2px 16px rgba(0,0,0,0.7)',
            transform: `translateY(${(1 - headlineSpring) * 30}px)`,
            opacity: headlineSpring,
          }}
        >
          {headline}
        </div>

        {/* Brand wordmark */}
        <div
          style={{
            marginTop: 24,
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 32,
            fontWeight: 700,
            color: firstKeysTheme.colors.gold,
            letterSpacing: '-0.5px',
            transform: `translateY(${(1 - brandSpring) * 16}px)`,
            opacity: brandSpring,
          }}
        >
          First Keys Indy
        </div>
      </div>

    </AbsoluteFill>
  );
};
