/**
 * SolutionScene — The answer / offer reveal.
 * Uplifting, brand-forward, hopeful.
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

export const SolutionScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 120 } });
  const textY = interpolate(localFrame, [0, 15], [40, 0], { extrapolateRight: 'clamp' });

  const headline = scene.headline || '';
  const emphasis = scene.emphasis;

  const renderHeadline = () => {
    if (!emphasis || !headline.includes(emphasis)) return <span>{headline}</span>;
    const parts = headline.split(emphasis);
    return (
      <>
        {parts[0]}
        <span style={{ color: brand.accent_color }}>{emphasis}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: scene.background_override || `linear-gradient(160deg, ${brand.primary_color}, ${brand.background_color})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        opacity,
      }}
    >
      {/* Solution badge */}
      <div
        style={{
          background: `${brand.accent_color}22`,
          border: `2px solid ${brand.accent_color}`,
          borderRadius: '100px',
          padding: '10px 28px',
          fontFamily: brand.font_body,
          fontSize: '20px',
          color: brand.accent_color,
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '32px',
          transform: `scale(${scale})`,
        }}
      >
        THE SOLUTION
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '64px',
          fontWeight: 900,
          color: brand.text_color,
          textAlign: 'center',
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          transform: `translateY(${textY}px)`,
          maxWidth: '900px',
        }}
      >
        {renderHeadline()}
      </div>

      {/* Body */}
      {scene.body && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '30px',
            color: `${brand.text_color}CC`,
            textAlign: 'center',
            marginTop: '28px',
            lineHeight: 1.5,
            maxWidth: '800px',
            transform: `translateY(${textY * 0.4}px)`,
          }}
        >
          {scene.body}
        </div>
      )}

      {/* Glow accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${brand.accent_color}, transparent)`,
        }}
      />

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
