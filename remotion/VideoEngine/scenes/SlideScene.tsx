/**
 * SlideScene — Generic slide. Title + body.
 * Works for steps, facts, education, announcements.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
  sceneIndex?: number; // For step numbering
}

export const SlideScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames, sceneIndex }) => {
  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const headlineY = interpolate(localFrame, [0, 12], [25, 0], { extrapolateRight: 'clamp' });
  const bodyOpacity = interpolate(localFrame, [8, 18], [0, 1], { extrapolateRight: 'clamp' });

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
        background: scene.background_override || brand.background_color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 64px',
        opacity,
      }}
    >
      {/* Step number (if step type or sceneIndex provided) */}
      {scene.type === 'step' && sceneIndex !== undefined && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: brand.accent_color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: brand.font_headline,
            fontSize: '28px',
            fontWeight: 900,
            color: brand.background_color,
            marginBottom: '32px',
          }}
        >
          {sceneIndex + 1}
        </div>
      )}

      {/* Accent left bar */}
      <div
        style={{
          width: '6px',
          height: '60px',
          background: brand.accent_color,
          borderRadius: '3px',
          marginBottom: '28px',
        }}
      />

      {/* Headline */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '58px',
          fontWeight: 800,
          color: brand.text_color,
          lineHeight: 1.15,
          letterSpacing: '-1px',
          transform: `translateY(${headlineY}px)`,
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
            fontSize: '32px',
            color: `${brand.text_color}CC`,
            marginTop: '28px',
            lineHeight: 1.55,
            maxWidth: '880px',
            opacity: bodyOpacity,
          }}
        >
          {scene.body}
        </div>
      )}

      {/* Caption */}
      {scene.caption_text && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '64px',
            right: '64px',
            fontFamily: brand.font_body,
            fontSize: '26px',
            color: brand.text_color,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '10px 20px',
            borderRadius: '8px',
            opacity: bodyOpacity,
          }}
        >
          {scene.caption_text}
        </div>
      )}
    </AbsoluteFill>
  );
};
