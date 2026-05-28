/**
 * DesireScene
 *
 * The hope shift — from pain toward the desired outcome.
 * Camera movement becomes smoother and more hopeful.
 * Warm color grade, slower motion, the "imagine if..." moment.
 *
 * Timing: 7–13s in the 31s structure (6 seconds)
 * Background: OpenAI image showing the aspirational outcome
 * Motion: pull_back (opening up → release from tension)
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

export const DesireScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  // Smooth pull-back motion — hopeful, opening
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.0, 1.16], { extrapolateRight: 'clamp' });
  const imgX     = interpolate(localFrame, [0, durationInFrames], [0, -16],   { extrapolateRight: 'clamp' });

  const sceneOpacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const bodyOpacity  = interpolate(localFrame, [16, 26], [0, 1], { extrapolateRight: 'clamp' });
  const bodyY        = interpolate(localFrame, [16, 26], [24, 0], { extrapolateRight: 'clamp' });
  const barScale     = spring({ frame: localFrame, fps, config: { damping: 22 } });

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
          background: `linear-gradient(160deg, ${brand.primary_color}, ${fallbackColor} 60%, ${brand.secondary_color})`,
        }} />
      )}

      {/* Overlays — lighter than pain scenes */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 38%, transparent 22%, rgba(0,0,0,0.60) 100%)' }} />}
      {/* Warm grade */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgb(180,100,20)', opacity: 0.20 }} />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 30%, rgba(0,0,0,0.75) 100%)',
      }} />

      {/* Warm glow at top — aspirational light */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '320px',
        background: `radial-gradient(ellipse at 50% 0%, ${brand.accent_color}28 0%, transparent 70%)`,
      }} />

      {/* Light sweep — slower, gentler than hook */}
      <LightSweep localFrame={localFrame} startFrame={4} duration={30} sweepColor="rgba(255,220,120,0.14)" />

      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 148, left: 56, right: 56, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 72, height: 5,
          background: `linear-gradient(90deg, ${brand.accent_color}, ${brand.secondary_color ?? brand.accent_color})`,
          borderRadius: 3,
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left center',
          boxShadow: `0 0 16px ${brand.accent_color}66`,
        }} />
      </div>

      {/* Imagine label */}
      <div style={{
        position: 'absolute', top: 164, left: 56, right: 56,
        display: 'flex', justifyContent: 'center',
        opacity: labelOpacity,
      }}>
        <div style={{
          fontFamily: brand.font_body, fontSize: 20, fontWeight: 700,
          color: brand.accent_color, letterSpacing: '3px', textTransform: 'uppercase',
          marginTop: 14,
        }}>
          Picture this →
        </div>
      </div>

      {/* Main text */}
      <div style={{
        position: 'absolute',
        top: 220, left: 56, right: 56, bottom: 260,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28,
      }}>
        {scene.headline && (
          <KineticHeadline
            text={scene.headline}
            localFrame={localFrame}
            fontFamily={brand.font_headline}
            color={brand.text_color}
            accentColor={brand.accent_color}
            emphasis={scene.emphasis}
            size="lg"
            staggerFrames={5}
            startDelay={6}
            glowEmphasis
            style={{ textAlign: 'center', maxWidth: '940px' }}
          />
        )}

        {scene.body && (
          <div style={{
            fontFamily: brand.font_body, fontSize: 34, fontWeight: 500,
            color: `${brand.text_color}CC`, textAlign: 'center',
            lineHeight: 1.5, maxWidth: 860,
            opacity: bodyOpacity, transform: `translateY(${bodyY}px)`,
          }}>
            {scene.body}
          </div>
        )}
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
