/**
 * CTAScene — Call to action end card.
 * Clear, branded, urgent. One action only.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
}

export const CTAScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const buttonScale = spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 14 } });
  const urlOpacity = interpolate(localFrame, [15, 25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: scene.background_override ||
          `linear-gradient(160deg, ${brand.secondary_color}, ${brand.primary_color} 60%, ${brand.background_color})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        opacity,
      }}
    >
      {/* Brand name / logo area */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '28px',
          color: brand.accent_color,
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        {brand.name}
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '60px',
          fontWeight: 900,
          color: brand.text_color,
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: '40px',
          maxWidth: '900px',
        }}
      >
        {scene.headline || 'Ready to get started?'}
      </div>

      {/* CTA Button */}
      <div
        style={{
          background: brand.accent_color,
          color: brand.background_color,
          fontFamily: brand.font_headline,
          fontSize: '34px',
          fontWeight: 800,
          padding: '24px 60px',
          borderRadius: '100px',
          textAlign: 'center',
          transform: `scale(${buttonScale})`,
          letterSpacing: '-0.5px',
        }}
      >
        {scene.cta_text || 'Learn More'}
      </div>

      {/* URL */}
      {scene.cta_url && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '30px',
            color: `${brand.text_color}99`,
            marginTop: '24px',
            opacity: urlOpacity,
          }}
        >
          {scene.cta_url.replace(/^https?:\/\//, '')}
        </div>
      )}

      {/* Tagline */}
      {brand.tagline && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            fontFamily: brand.font_body,
            fontSize: '24px',
            color: `${brand.text_color}66`,
            textAlign: 'center',
            opacity: urlOpacity,
          }}
        >
          {brand.tagline}
        </div>
      )}

      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${brand.accent_color}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
