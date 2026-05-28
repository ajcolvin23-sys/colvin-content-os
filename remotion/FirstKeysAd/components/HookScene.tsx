/**
 * HookScene — 0:00–0:03
 *
 * Must stop the scroll in 1 second.
 * Headline PUNCHES in (fast spring, slight overshoot).
 * Subheadline slides up after.
 * Background: stressed renter photo (cold blue grade).
 * Dramatic Ken Burns: 1.22 → 1.0
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  headline: string;
  subheadline: string;
  imageUrl?: string;
  localFrame: number;
  durationInFrames: number;
}

export const HookScene: React.FC<Props> = ({
  headline,
  subheadline,
  imageUrl,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const fadeIn   = interpolate(localFrame, [0, 6], [0, 1],  { extrapolateRight: 'clamp' });
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.22, 1.0], { extrapolateRight: 'clamp' });

  // Headline: fast punch-in with very slight overshoot
  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 300 },
  });
  const headlineScale = interpolate(headlineSpring, [0, 1], [1.45, 1.0]);

  // Subheadline: slides up after headline settles
  const subSpring = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const subY = interpolate(subSpring, [0, 1], [35, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>

      {/* ── Background ── */}
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
            transformOrigin: 'center center',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, ${firstKeysTheme.colors.navyDark} 0%, #1a0a0a 100%)`,
          }}
        />
      )}

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 38%, transparent 18%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Cold blue tension grade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(12, 30, 68, 0.38)',
        }}
      />

      {/* Bottom text gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.52) 38%, transparent 65%)',
        }}
      />

      {/* ── Text block ── */}
      <div
        style={{
          position: 'absolute',
          bottom: firstKeysTheme.safe.bottom + 48,
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 72,
            height: 5,
            background: firstKeysTheme.colors.gold,
            borderRadius: 3,
            marginBottom: 28,
            boxShadow: `0 0 12px ${firstKeysTheme.colors.gold}66`,
          }}
        />

        {/* Headline — punch */}
        <div
          style={{
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 76,
            fontWeight: 900,
            color: firstKeysTheme.colors.white,
            lineHeight: 1.08,
            letterSpacing: '-2.5px',
            textShadow: '0 3px 24px rgba(0,0,0,0.7)',
            transform: `scale(${headlineScale})`,
            transformOrigin: 'left bottom',
          }}
        >
          {headline}
        </div>

        {/* Subheadline — slides up */}
        <div
          style={{
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 54,
            fontWeight: 700,
            color: firstKeysTheme.colors.gold,
            lineHeight: 1.2,
            marginTop: 18,
            letterSpacing: '-1px',
            textShadow: '0 2px 14px rgba(0,0,0,0.6)',
            transform: `translateY(${subY}px)`,
            opacity: subSpring,
          }}
        >
          {subheadline}
        </div>
      </div>

    </AbsoluteFill>
  );
};
