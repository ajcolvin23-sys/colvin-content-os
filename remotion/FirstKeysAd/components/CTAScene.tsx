/**
 * CTAScene — 0:22–0:25
 *
 * Clean, centered, no photo competition.
 * CTA button pulses. Website URL fades in beneath.
 * Navy brand background with subtle gold glow at top.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { CTAButton } from './CTAButton';
import { firstKeysTheme } from '../theme/firstKeysTheme';

interface Props {
  headline: string;
  button: string;
  footer: string;
  localFrame: number;
  durationInFrames: number;
}

export const CTAScene: React.FC<Props> = ({
  headline,
  button,
  footer,
  localFrame,
}) => {
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const footerSpring = spring({
    frame: Math.max(0, localFrame - 22),
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>

      {/* Brand background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(170deg, ${firstKeysTheme.colors.navyDark} 0%, ${firstKeysTheme.colors.navy} 55%, #0D2B1A 100%)`,
        }}
      />

      {/* Gold glow — top center */}
      <div
        style={{
          position: 'absolute',
          top: -250,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '130%',
          height: 700,
          background: `radial-gradient(ellipse at 50% 0%, rgba(242,184,75,0.16) 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Content — centered in safe zone */}
      <div
        style={{
          position: 'absolute',
          top: firstKeysTheme.safe.top,
          bottom: firstKeysTheme.safe.bottom,
          left: firstKeysTheme.safe.left,
          right: firstKeysTheme.safe.right,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 36,
        }}
      >
        {/* House icon */}
        <div style={{ fontSize: 88 }}>🏠</div>

        {/* Headline */}
        <div
          style={{
            fontFamily: firstKeysTheme.fonts.heading,
            fontSize: 66,
            fontWeight: 900,
            color: firstKeysTheme.colors.white,
            lineHeight: 1.12,
            letterSpacing: '-2px',
            textShadow: '0 2px 18px rgba(0,0,0,0.5)',
            transform: `translateY(${(1 - headlineSpring) * 28}px)`,
            opacity: headlineSpring,
          }}
        >
          {headline}
        </div>

        {/* CTA Button */}
        <CTAButton label={button} startFrame={14} />

        {/* Footer URL */}
        <div
          style={{
            fontFamily: firstKeysTheme.fonts.body,
            fontSize: 30,
            fontWeight: 600,
            color: `${firstKeysTheme.colors.white}88`,
            letterSpacing: '0.5px',
            transform: `translateY(${(1 - footerSpring) * 14}px)`,
            opacity: footerSpring,
          }}
        >
          {footer}
        </div>
      </div>

    </AbsoluteFill>
  );
};
