/**
 * ImageOverlayScene
 *
 * Full-bleed photo of a person with text overlaid on a gradient.
 * Used when a scene has assets[0].url set (populated by fetchAssets.ts before render).
 *
 * Layout:
 *   - Photo fills the frame (objectFit: cover)
 *   - Dark gradient overlay bottom-to-top so text is always readable
 *   - Headline + body text sit in the bottom third
 *   - Caption bar at the very bottom
 *   - Falls back gracefully to brand color if no image URL
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
}

export const ImageOverlayScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const imageUrl = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  // Animations
  const fadeIn   = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const textY    = interpolate(localFrame, [0, 18], [40, 0], { extrapolateRight: 'clamp' });
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.08, 1.0], { extrapolateRight: 'clamp' }); // Ken Burns
  const badgeScale = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 100 } });

  const headline = scene.headline ?? '';
  const emphasis = scene.emphasis;

  const renderHeadline = () => {
    if (!emphasis || !headline.includes(emphasis)) return <span>{headline}</span>;
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
    <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>

      {/* ── Background: photo or fallback color ── */}
      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transform: `scale(${imgScale})`,
            transformOrigin: 'center center',
          }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: fallbackColor }} />
      )}

      {/* ── Gradient overlay — makes text readable ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: imageUrl
            ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.0) 100%)'
            : `linear-gradient(160deg, ${brand.primary_color}DD, ${brand.background_color})`,
        }}
      />

      {/* ── Optional scene-type badge (top left) ── */}
      {scene.type !== 'slide' && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '48px',
            background: `${brand.accent_color}22`,
            border: `2px solid ${brand.accent_color}88`,
            borderRadius: '100px',
            padding: '8px 24px',
            fontFamily: brand.font_body,
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: brand.accent_color,
            transform: `scale(${badgeScale})`,
            transformOrigin: 'left center',
          }}
        >
          {scene.type.replace('_', ' ')}
        </div>
      )}

      {/* ── Text block — bottom third ── */}
      <div
        style={{
          position: 'absolute',
          bottom: scene.caption_text ? '160px' : '80px',
          left: '48px',
          right: '48px',
          transform: `translateY(${textY}px)`,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: '64px',
            height: '5px',
            background: brand.accent_color,
            borderRadius: '3px',
            marginBottom: '20px',
          }}
        />

        {/* Headline */}
        <div
          style={{
            fontFamily: brand.font_headline,
            fontSize: '60px',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
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
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.45,
              marginTop: '20px',
              textShadow: '0 1px 8px rgba(0,0,0,0.6)',
            }}
          >
            {scene.body}
          </div>
        )}

        {/* Stat (proof scenes) */}
        {scene.stat && (
          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                fontFamily: brand.font_headline,
                fontSize: '96px',
                fontWeight: 900,
                color: brand.accent_color,
                lineHeight: 1,
                textShadow: `0 0 40px ${brand.accent_color}66`,
              }}
            >
              {scene.stat}
            </div>
            {scene.stat_label && (
              <div
                style={{
                  fontFamily: brand.font_body,
                  fontSize: '28px',
                  color: 'rgba(255,255,255,0.75)',
                  marginTop: '8px',
                }}
              >
                {scene.stat_label}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {scene.cta_text && (
          <div
            style={{
              display: 'inline-block',
              marginTop: '32px',
              background: brand.accent_color,
              color: brand.background_color,
              fontFamily: brand.font_headline,
              fontSize: '32px',
              fontWeight: 800,
              padding: '16px 40px',
              borderRadius: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            {scene.cta_text}
          </div>
        )}
      </div>

      {/* ── Caption bar ── */}
      {scene.caption_text && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '48px',
            right: '48px',
            fontFamily: brand.font_body,
            fontSize: '26px',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.72)',
            padding: '12px 20px',
            borderRadius: '10px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {scene.caption_text}
        </div>
      )}

      {/* ── Photo credit (bottom right, tiny) ── */}
      {imageUrl && scene.assets?.[0]?.description && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            fontFamily: brand.font_body,
            fontSize: '16px',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          📷 Pexels
        </div>
      )}
    </AbsoluteFill>
  );
};
