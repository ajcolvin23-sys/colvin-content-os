/**
 * HookScene — First 3 seconds. Stop the scroll.
 * Big, bold, high-contrast. One idea only.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number; // Frame relative to scene start
  durationInFrames: number;
}

export const HookScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(localFrame, [0, 10], [0.92, 1], { extrapolateRight: 'clamp' });
  const textY = interpolate(localFrame, [0, 12], [30, 0], { extrapolateRight: 'clamp' });

  // Emphasis word highlighting
  const headline = scene.headline || '';
  const emphasis = scene.emphasis;

  const renderHeadline = () => {
    if (!emphasis || !headline.includes(emphasis)) {
      return <span>{headline}</span>;
    }
    const parts = headline.split(emphasis);
    return (
      <>
        {parts[0]}
        <span style={{ color: brand.accent_color, fontStyle: 'italic' }}>{emphasis}</span>
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        opacity,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: '80px',
          height: '6px',
          background: brand.accent_color,
          borderRadius: '3px',
          marginBottom: '32px',
          transform: `scaleX(${scale})`,
          transformOrigin: 'left center',
        }}
      />

      {/* Main headline */}
      <div
        style={{
          fontFamily: brand.font_headline,
          fontSize: '72px',
          fontWeight: 900,
          color: brand.text_color,
          textAlign: 'center',
          lineHeight: 1.1,
          letterSpacing: '-2px',
          transform: `translateY(${textY}px) scale(${scale})`,
        }}
      >
        {renderHeadline()}
      </div>

      {/* Subtext */}
      {scene.body && (
        <div
          style={{
            fontFamily: brand.font_body,
            fontSize: '32px',
            color: `${brand.text_color}CC`,
            textAlign: 'center',
            marginTop: '24px',
            lineHeight: 1.4,
            transform: `translateY(${textY * 0.6}px)`,
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
            bottom: '80px',
            left: '48px',
            right: '48px',
            fontFamily: brand.font_body,
            fontSize: '28px',
            color: brand.text_color,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '12px 20px',
            borderRadius: '8px',
          }}
        >
          {scene.caption_text}
        </div>
      )}
    </AbsoluteFill>
  );
};
