/**
 * WorkflowAuditScene.tsx
 * The offer scene — "Free Workflow Audit."
 * Clean, trustworthy, no-hype energy.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

interface WorkflowAuditSceneProps {
  headline:         string;
  subheadline?:     string;
  badge?:           string;
  localFrame:       number;
  durationInFrames: number;
}

export const WorkflowAuditScene: React.FC<WorkflowAuditSceneProps> = ({
  headline,
  subheadline,
  badge,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const textSpring = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, localFrame - 18),
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        background: colvinTheme.colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Electric center glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 600,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.electric}20 0%, transparent 65%)`,
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
          gap: 32,
          height: '100%',
        }}
      >
        {/* Offer card */}
        <div
          style={{
            background: colvinTheme.colors.navyMid,
            border: `1px solid ${colvinTheme.colors.electric}40`,
            borderRadius: 20,
            padding: '52px 44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            opacity: cardSpring,
            transform: `scale(${0.88 + cardSpring * 0.12}) translateY(${(1 - cardSpring) * 40}px)`,
            boxShadow: `0 0 60px ${colvinTheme.colors.electric}18, 0 8px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: 72 }}>🔍</div>

          {/* Headline */}
          <div
            style={{
              fontFamily: colvinTheme.fonts.heading,
              fontSize: 62,
              fontWeight: 900,
              color: colvinTheme.colors.white,
              lineHeight: 1.1,
              letterSpacing: '-2px',
              opacity: textSpring,
            }}
          >
            {headline}
          </div>

          {/* Subheadline */}
          {subheadline && (
            <div
              style={{
                fontFamily: colvinTheme.fonts.body,
                fontSize: 30,
                fontWeight: 500,
                color: colvinTheme.colors.offWhite,
                lineHeight: 1.4,
                opacity: textSpring,
                maxWidth: 580,
              }}
            >
              {subheadline}
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div
              style={{
                padding: '10px 24px',
                background: `${colvinTheme.colors.green}20`,
                border: `1px solid ${colvinTheme.colors.green}50`,
                borderRadius: 100,
                fontFamily: colvinTheme.fonts.body,
                fontSize: 24,
                fontWeight: 700,
                color: colvinTheme.colors.green,
                letterSpacing: '0.3px',
                opacity: badgeSpring,
                transform: `translateY(${(1 - badgeSpring) * 16}px)`,
              }}
            >
              ✓ {badge}
            </div>
          )}
        </div>

        {/* Bottom brand */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.body,
            fontSize: 24,
            color: colvinTheme.colors.electric,
            fontWeight: 600,
            letterSpacing: '0.5px',
            opacity: badgeSpring * 0.8,
          }}
        >
          COLVIN ENTERPRISES
        </div>
      </div>
    </AbsoluteFill>
  );
};
