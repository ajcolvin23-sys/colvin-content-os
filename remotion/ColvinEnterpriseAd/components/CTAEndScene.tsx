/**
 * CTAEndScene.tsx
 * Final CTA — clean dark screen, glowing button, URL footer.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

interface CTAEndSceneProps {
  headline:         string;
  button:           string;
  footer:           string;
  localFrame:       number;
  durationInFrames: number;
}

export const CTAEndScene: React.FC<CTAEndSceneProps> = ({
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

  // Button pulse
  const pulseScale = 1 + Math.sin(localFrame * 0.11) * 0.018;

  const footerSpring = spring({
    frame: Math.max(0, localFrame - 22),
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: colvinTheme.colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Electric glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.electric}22 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${colvinTheme.safe.top}px ${colvinTheme.safe.left}px ${colvinTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 40,
          height: '100%',
        }}
      >
        {/* ⚡ icon */}
        <div
          style={{
            fontSize: 80,
            opacity: containerSpring,
            transform: `scale(${0.6 + containerSpring * 0.4})`,
          }}
        >
          ⚡
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 56,
            fontWeight: 800,
            color: colvinTheme.colors.white,
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
            padding: '26px 56px',
            background: `linear-gradient(135deg, ${colvinTheme.colors.electric}, ${colvinTheme.colors.cyan})`,
            borderRadius: 100,
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 34,
            fontWeight: 800,
            color: colvinTheme.colors.navy,
            letterSpacing: '-0.5px',
            opacity: buttonSpring,
            transform: `scale(${(0.7 + buttonSpring * 0.3) * pulseScale})`,
            boxShadow: `0 0 40px ${colvinTheme.colors.electric}60, 0 8px 30px rgba(0,0,0,0.4)`,
            cursor: 'default',
          }}
        >
          {button}
        </div>

        {/* Footer URL */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.body,
            fontSize: 28,
            color: colvinTheme.colors.electric,
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
