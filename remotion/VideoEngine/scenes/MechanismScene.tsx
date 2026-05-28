/**
 * MechanismScene
 *
 * 3-step solution cards. How the offer works.
 * Cards spring in sequentially — each one revealing after ~1.5s.
 * Each card: number badge + title + optional description.
 *
 * Timing: 13–21s in the 31s structure (8 seconds)
 * Background: OpenAI image showing the transformed environment or use case
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

const CARD_STAGGER = 40; // frames between each card appearance

export const MechanismScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  const steps = scene.steps ?? [];
  const sceneOpacity  = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const headlineDelay = 4;

  // Slow drift for mechanism — not aggressive, contemplative
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.06, 1.0], { extrapolateRight: 'clamp' });
  const imgX     = interpolate(localFrame, [0, durationInFrames], [-10, 10], { extrapolateRight: 'clamp' });

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
          background: `linear-gradient(160deg, ${brand.primary_color} 0%, ${fallbackColor} 100%)`,
        }} />
      )}

      {/* Overlays */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.60)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, transparent 18%, rgba(0,0,0,0.65) 100%)' }} />}
      {/* Neutral-to-warm grade for solution context */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgb(180,100,20)', opacity: 0.16 }} />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 25%, rgba(0,0,0,0.88) 100%)',
      }} />

      <LightSweep localFrame={localFrame} startFrame={2} duration={20} />

      {/* Headline */}
      <div style={{
        position: 'absolute', top: 138, left: 56, right: 56,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>
        {scene.headline && (
          <KineticHeadline
            text={scene.headline}
            localFrame={localFrame}
            fontFamily={brand.font_headline}
            color={brand.text_color}
            accentColor={brand.accent_color}
            emphasis={scene.emphasis}
            size="md"
            staggerFrames={5}
            startDelay={headlineDelay}
            glowEmphasis
            style={{ textAlign: 'center', maxWidth: '960px' }}
          />
        )}
      </div>

      {/* Step cards */}
      <div style={{
        position: 'absolute',
        top: steps.length > 0 && scene.headline ? 320 : 200,
        left: 56, right: 56, bottom: 240,
        display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', justifyContent: 'center',
        gap: 24,
      }}>
        {steps.map((step, i) => {
          const cardStart = i * CARD_STAGGER + 10;
          const cardFrame = Math.max(0, localFrame - cardStart);
          const cardSpring = spring({
            frame: cardFrame, fps,
            config: { damping: 18, stiffness: 200, mass: 0.6 },
          });
          const cardOpacity = Math.min(cardSpring, 1);
          const cardX = (1 - cardSpring) * 60;

          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${brand.accent_color}44`,
                borderRadius: 20,
                padding: '20px 24px',
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
              }}
            >
              {/* Number badge */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: brand.accent_color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: brand.font_headline, fontSize: 26, fontWeight: 900,
                color: brand.background_color,
                boxShadow: `0 0 16px ${brand.accent_color}66`,
              }}>
                {step.number}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: brand.font_headline,
                  fontSize: 34, fontWeight: 800,
                  color: brand.text_color, lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                }}>
                  {step.title}
                </div>
                {step.description && (
                  <div style={{
                    fontFamily: brand.font_body,
                    fontSize: 24, fontWeight: 400,
                    color: `${brand.text_color}99`, lineHeight: 1.35,
                    marginTop: 6,
                  }}>
                    {step.description}
                  </div>
                )}
              </div>

              {/* Check mark — appears with the card */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `2px solid ${brand.accent_color}88`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: brand.accent_color, fontSize: 18,
              }}>
                ✓
              </div>
            </div>
          );
        })}
      </div>

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
