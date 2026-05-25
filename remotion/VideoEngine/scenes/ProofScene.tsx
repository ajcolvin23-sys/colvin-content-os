/**
 * ProofScene — Social proof / credibility.
 * Big number or result. Evidence-focused.
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

export const ProofScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const statScale = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 100 } });
  const bodyOpacity = interpolate(localFrame, [10, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: scene.background_override || brand.background_color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        opacity,
      }}
    >
      {/* Headline */}
      {scene.headline && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '28px',
            color: `${brand.text_color}99`,
            textAlign: 'center',
            marginBottom: '32px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
          }}
        >
          {scene.headline}
        </div>
      )}

      {/* Big stat */}
      {scene.stat && (
        <div
          style={{
            fontFamily: brand.font_headline,
            fontSize: '120px',
            fontWeight: 900,
            color: brand.accent_color,
            textAlign: 'center',
            lineHeight: 1,
            transform: `scale(${statScale})`,
            letterSpacing: '-4px',
          }}
        >
          {scene.stat}
        </div>
      )}

      {/* Stat label */}
      {scene.stat_label && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '32px',
            color: brand.text_color,
            textAlign: 'center',
            marginTop: '16px',
            fontWeight: 600,
            opacity: bodyOpacity,
          }}
        >
          {scene.stat_label}
        </div>
      )}

      {/* Body */}
      {scene.body && !scene.stat && (
        <div
          style={{
            fontFamily: brand.font_headline,
            fontSize: '52px',
            fontWeight: 800,
            color: brand.text_color,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '900px',
            opacity: bodyOpacity,
          }}
        >
          {scene.body}
        </div>
      )}

      {/* Body below stat */}
      {scene.body && scene.stat && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '28px',
            color: `${brand.text_color}BB`,
            textAlign: 'center',
            marginTop: '20px',
            opacity: bodyOpacity,
          }}
        >
          {scene.body}
        </div>
      )}

      {/* Accent ring behind stat */}
      {scene.stat && (
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: `2px solid ${brand.accent_color}22`,
            transform: `scale(${statScale * 1.2})`,
          }}
        />
      )}

      {/* Caption */}
      {scene.caption_text && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '48px',
            right: '48px',
            fontFamily: brand.font_body,
            fontSize: '26px',
            color: brand.text_color,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
        >
          {scene.caption_text}
        </div>
      )}
    </AbsoluteFill>
  );
};
