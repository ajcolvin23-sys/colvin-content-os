/**
 * MusicCTAScene.tsx
 * Final CTA. Dark, pulsing gold button, URL footer.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { musicTheme } from '../theme/musicTheme';

interface MusicCTASceneProps {
  headline:         string;
  button:           string;
  footer:           string;
  localFrame:       number;
  durationInFrames: number;
}

export const MusicCTAScene: React.FC<MusicCTASceneProps> = ({
  headline,
  button,
  footer,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const containerSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 130 },
  });

  const buttonSpring = spring({
    frame: Math.max(0, localFrame - 14),
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  // Gentle pulse
  const pulseScale = 1 + Math.sin(localFrame * 0.11) * 0.02;

  const footerSpring = spring({
    frame: Math.max(0, localFrame - 24),
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: musicTheme.colors.black,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background: `radial-gradient(ellipse, ${musicTheme.colors.gold}22 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${musicTheme.safe.top}px ${musicTheme.safe.left}px ${musicTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 44,
          height: '100%',
        }}
      >
        {/* Music note */}
        <div
          style={{
            fontSize: 80,
            opacity: containerSpring,
            transform: `scale(${0.6 + containerSpring * 0.4})`,
          }}
        >
          🎵
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: musicTheme.fonts.heading,
            fontSize: 52,
            fontWeight: 800,
            color: musicTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1.5px',
            opacity: containerSpring,
            transform: `translateY(${(1 - containerSpring) * 30}px)`,
          }}
        >
          {headline}
        </div>

        {/* Button */}
        <div
          style={{
            padding: '28px 56px',
            background: `linear-gradient(135deg, ${musicTheme.colors.gold}, ${musicTheme.colors.coral})`,
            borderRadius: 100,
            fontFamily: musicTheme.fonts.heading,
            fontSize: 36,
            fontWeight: 800,
            color: musicTheme.colors.black,
            letterSpacing: '-0.5px',
            opacity: buttonSpring,
            transform: `scale(${(0.7 + buttonSpring * 0.3) * pulseScale})`,
            boxShadow: `0 0 40px ${musicTheme.colors.gold}55, 0 8px 30px rgba(0,0,0,0.4)`,
            cursor: 'default',
          }}
        >
          {button}
        </div>

        {/* Footer */}
        <div
          style={{
            fontFamily: musicTheme.fonts.body,
            fontSize: 28,
            color: musicTheme.colors.gold,
            fontWeight: 600,
            letterSpacing: '0.3px',
            opacity: footerSpring * 0.9,
            transform: `translateY(${(1 - footerSpring) * 16}px)`,
          }}
        >
          {footer}
        </div>
      </div>
    </AbsoluteFill>
  );
};
