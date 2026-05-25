/**
 * ProblemScene — Pain point / problem agitation.
 * Dark, tense — audience recognizes themselves.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
}

export const ProblemScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const textY = interpolate(localFrame, [0, 12], [20, 0], { extrapolateRight: 'clamp' });

  // Pulse effect on emphasis
  const pulse = interpolate(
    localFrame,
    [0, durationInFrames / 2, durationInFrames],
    [1, 1.04, 1],
    { extrapolateRight: 'clamp' }
  );

  const headline = scene.headline || '';
  const emphasis = scene.emphasis;

  const renderHeadline = () => {
    if (!emphasis || !headline.includes(emphasis)) return <span>{headline}</span>;
    const parts = headline.split(emphasis);
    return (
      <>
        {parts[0]}
        <span style={{ color: '#FF6B6B', transform: `scale(${pulse})`, display: 'inline-block' }}>
          {emphasis}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: scene.background_override || `${brand.background_color}F0`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        opacity,
      }}
    >
      {/* Problem label */}
      <div
        style={{
          fontFamily: brand.font_body,
          fontSize: '22px',
          color: '#FF6B6B',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          marginBottom: '24px',
          fontWeight: 700,
        }}
      >
        THE PROBLEM
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '58px',
          fontWeight: 800,
          color: brand.text_color,
          textAlign: 'center',
          lineHeight: 1.15,
          transform: `translateY(${textY}px)`,
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
            color: `${brand.text_color}BB`,
            textAlign: 'center',
            marginTop: '28px',
            lineHeight: 1.5,
            maxWidth: '800px',
            transform: `translateY(${textY * 0.5}px)`,
          }}
        >
          {scene.body}
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '10%',
          right: '10%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, #FF6B6B44, transparent)`,
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
            backgroundColor: 'rgba(0,0,0,0.7)',
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
