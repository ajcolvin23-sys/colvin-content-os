/**
 * AutomationPipelineScene.tsx
 * Shows pipeline nodes lighting up sequentially — the "what if" moment.
 * Green glow activations demonstrate automated flow.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';
import { PipelineFlow } from './PipelineFlow';
import type { ColvinPipelineNode } from '../data/colvinEnterpriseAds';

interface AutomationPipelineSceneProps {
  headline:         string;
  badge?:           string;
  nodes:            ColvinPipelineNode[];
  localFrame:       number;
  durationInFrames: number;
}

export const AutomationPipelineScene: React.FC<AutomationPipelineSceneProps> = ({
  headline,
  badge,
  nodes,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: { damping: 20, stiffness: 140 },
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
        background: `linear-gradient(160deg, ${colvinTheme.colors.navy} 0%, #071422 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Green success glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 300,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 500,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.green}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${colvinTheme.safe.top}px ${colvinTheme.safe.left}px ${colvinTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Badge */}
        {badge && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '8px 18px',
              background: `${colvinTheme.colors.green}18`,
              border: `1px solid ${colvinTheme.colors.green}40`,
              borderRadius: 100,
              fontFamily: colvinTheme.fonts.body,
              fontSize: 22,
              fontWeight: 700,
              color: colvinTheme.colors.green,
              letterSpacing: '0.5px',
              opacity: badgeSpring,
              transform: `translateY(${(1 - badgeSpring) * 16}px)`,
            }}
          >
            ⚡ {badge}
          </div>
        )}

        {/* Headline */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 46,
            fontWeight: 800,
            color: colvinTheme.colors.white,
            lineHeight: 1.2,
            letterSpacing: '-1.2px',
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -20}px)`,
          }}
        >
          {headline}
        </div>

        {/* Pipeline */}
        <div style={{ marginTop: 8 }}>
          <PipelineFlow nodes={nodes} localFrame={Math.max(0, localFrame - 20)} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
