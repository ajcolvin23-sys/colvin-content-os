/**
 * CTAScene — Cinematic call-to-action end card.
 *
 * Upgrades over v1:
 *   - Full AI image background with cinematic overlays
 *   - KineticHeadline word-by-word reveal
 *   - Pulsing CTA button (breathing loop animation)
 *   - LightSweep entrance
 *   - Brand name + tagline with staggered fade-in
 *   - URL domain reveal with spring
 *
 * One action only. One URL. Urgency without noise.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';
import { KineticHeadline } from '../components/KineticHeadline';
import { LightSweep } from '../components/LightSweep';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
}

export const CTAScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  // Pull-back motion — triumphant opening
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.0, 1.14], { extrapolateRight: 'clamp' });
  const imgX     = interpolate(localFrame, [0, durationInFrames], [0, -10],   { extrapolateRight: 'clamp' });

  const sceneOpacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Brand name fade in
  const brandOpacity = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });

  // Button — spring in + continuous pulse loop
  const buttonSpring  = spring({ frame: Math.max(0, localFrame - 18), fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const pulseProgress = (localFrame % 50) / 50; // 50-frame loop
  const pulseScale    = 1 + Math.sin(pulseProgress * Math.PI * 2) * 0.025;
  const buttonScale   = buttonSpring * pulseScale;
  const buttonGlow    = 0.4 + Math.sin(pulseProgress * Math.PI * 2) * 0.2;

  // URL + tagline fade in
  const urlOpacity  = interpolate(localFrame, [22, 32], [0, 1], { extrapolateRight: 'clamp' });
  const barScale    = spring({ frame: localFrame, fps, config: { damping: 22 } });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, overflow: 'hidden' }}>

      {/* Background */}
      {imageUrl ? (
        <div style={{ position: 'absolute', inset: '-6%', transform: `translateX(${imgX}px)` }}>
          <Img src={imageUrl} style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            transform: `scale(${imgScale})`, transformOrigin: 'center center',
          }} />
        </div>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: scene.background_override ||
            `linear-gradient(160deg, ${brand.secondary_color ?? brand.primary_color} 0%, ${brand.primary_color} 50%, ${fallbackColor} 100%)`,
        }} />
      )}

      {/* Overlays */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, transparent 15%, rgba(0,0,0,0.70) 100%)' }} />}
      {/* Warm triumphant grade */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgb(180,100,20)', opacity: 0.22 }} />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 25%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* Top accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '280px',
        background: `radial-gradient(ellipse at 50% 0%, ${brand.accent_color}30 0%, transparent 68%)`,
      }} />

      <LightSweep localFrame={localFrame} startFrame={2} duration={24} sweepColor="rgba(255,220,120,0.16)" />

      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 132, left: 56, right: 56, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 72, height: 5,
          background: `linear-gradient(90deg, ${brand.accent_color}, ${brand.secondary_color ?? brand.accent_color})`,
          borderRadius: 3,
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left center',
          boxShadow: `0 0 16px ${brand.accent_color}66`,
        }} />
      </div>

      {/* Brand name */}
      <div style={{
        position: 'absolute', top: 152, left: 56, right: 56,
        display: 'flex', justifyContent: 'center',
        opacity: brandOpacity,
      }}>
        <div style={{
          fontFamily: brand.font_body, fontSize: 19, fontWeight: 800,
          color: brand.accent_color, letterSpacing: '3.5px', textTransform: 'uppercase' as const,
          marginTop: 12,
        }}>
          {brand.name}
        </div>
      </div>

      {/* Headline */}
      <div style={{
        position: 'absolute',
        top: 220, left: 56, right: 56, bottom: 300,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 48,
      }}>
        <KineticHeadline
          text={scene.headline || 'Ready to get started?'}
          localFrame={localFrame}
          fontFamily={brand.font_headline}
          color={brand.text_color}
          accentColor={brand.accent_color}
          emphasis={scene.emphasis}
          size="lg"
          staggerFrames={4}
          startDelay={5}
          glowEmphasis
          style={{ textAlign: 'center', maxWidth: '880px' }}
        />

        {/* CTA Button */}
        <div style={{
          transform: `scale(${buttonScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            background: brand.accent_color,
            color: brand.background_color,
            fontFamily: brand.font_headline,
            fontSize: 34, fontWeight: 900,
            padding: '26px 64px',
            borderRadius: 100,
            textAlign: 'center',
            letterSpacing: '-0.5px',
            boxShadow: `0 0 ${40 * buttonGlow}px ${brand.accent_color}${Math.round(buttonGlow * 255).toString(16).padStart(2, '0')}, 0 8px 32px rgba(0,0,0,0.40)`,
          }}>
            {scene.cta_text || 'Learn More'}
          </div>

          {/* URL domain */}
          {scene.cta_url && (
            <div style={{
              fontFamily: brand.font_body,
              fontSize: 26, fontWeight: 500,
              color: `${brand.text_color}AA`,
              opacity: urlOpacity,
              letterSpacing: '0.5px',
            }}>
              {scene.cta_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </div>
          )}
        </div>
      </div>

      {/* Tagline */}
      {brand.tagline && (
        <div style={{
          position: 'absolute', bottom: 80, left: 56, right: 56,
          fontFamily: brand.font_body, fontSize: 22, fontWeight: 500,
          color: `${brand.text_color}66`, textAlign: 'center',
          opacity: urlOpacity, letterSpacing: '0.5px',
        }}>
          {brand.tagline}
        </div>
      )}

      {/* Caption */}
      {scene.caption_text && (
        <div style={{
          position: 'absolute', bottom: 60, left: 56, right: 56,
          fontFamily: brand.font_body, fontSize: 26, fontWeight: 600,
          color: brand.text_color, textAlign: 'center',
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          padding: '12px 24px', borderRadius: 12, lineHeight: 1.4,
        }}>
          {scene.caption_text}
        </div>
      )}
    </AbsoluteFill>
  );
};
