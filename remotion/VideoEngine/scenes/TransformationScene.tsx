/**
 * TransformationScene
 *
 * The emotional payoff — before/after reveal.
 * Two staggered cards (BEFORE / AFTER) spring in with contrasting energy.
 * The "after" card hits with warmth and triumph.
 *
 * Timing: 21–26s in the 31s structure (5 seconds)
 * Background: OpenAI image showing the transformed outcome
 * Motion: pull_back (opening up, release, freedom)
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

export const TransformationScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  // Pull back — liberation, expansion
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.0, 1.14], { extrapolateRight: 'clamp' });
  const imgX     = interpolate(localFrame, [0, durationInFrames], [0, -12], { extrapolateRight: 'clamp' });

  const sceneOpacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // BEFORE card — slides in from left, cold tone
  const beforeSpring = spring({
    frame: Math.max(0, localFrame - 8), fps,
    config: { damping: 20, stiffness: 180, mass: 0.7 },
  });
  const beforeOpacity = Math.min(beforeSpring, 1);
  const beforeX       = (1 - beforeSpring) * -60;

  // AFTER card — slides in from right, delayed, warm & triumphant
  const afterSpring = spring({
    frame: Math.max(0, localFrame - 24), fps,
    config: { damping: 16, stiffness: 220, mass: 0.6 },
  });
  const afterOpacity = Math.min(afterSpring, 1);
  const afterX       = (1 - afterSpring) * 60;

  // Divider pulse
  const dividerScale = spring({
    frame: Math.max(0, localFrame - 16), fps,
    config: { damping: 22, stiffness: 300, mass: 0.4 },
  });

  // Headline reveal
  const headlineDelay = 12;

  // Before/after text — pull from scene fields
  const beforeText = scene.before_state ?? 'Drowning in manual work';
  const afterText  = scene.after_state  ?? 'Running a streamlined system';

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
          background: `linear-gradient(160deg, ${brand.primary_color} 0%, ${fallbackColor} 60%, ${brand.secondary_color ?? brand.background_color} 100%)`,
        }} />
      )}

      {/* Overlays */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 38%, transparent 18%, rgba(0,0,0,0.68) 100%)' }} />}
      {/* Warm triumphant grade */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgb(180,100,20)', opacity: 0.18 }} />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 28%, rgba(0,0,0,0.82) 100%)',
      }} />

      {/* Warm glow — top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '300px',
        background: `radial-gradient(ellipse at 50% 0%, ${brand.accent_color}22 0%, transparent 70%)`,
      }} />

      <LightSweep localFrame={localFrame} startFrame={2} duration={24} sweepColor="rgba(255,220,120,0.12)" />

      {/* Headline */}
      <div style={{
        position: 'absolute', top: 128, left: 56, right: 56,
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
            style={{ textAlign: 'center', maxWidth: '920px' }}
          />
        )}
      </div>

      {/* Before / After cards */}
      <div style={{
        position: 'absolute',
        top: scene.headline ? 320 : 220,
        left: 56, right: 56, bottom: 240,
        display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', justifyContent: 'center',
        gap: 0,
      }}>

        {/* BEFORE card */}
        <div style={{
          opacity: beforeOpacity,
          transform: `translateX(${beforeX}px)`,
          display: 'flex', alignItems: 'center', gap: 20,
          background: 'rgba(20,20,40,0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,107,107,0.35)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 28px',
        }}>
          {/* BEFORE badge */}
          <div style={{
            paddingLeft: 14, paddingRight: 14, paddingTop: 6, paddingBottom: 6,
            background: 'rgba(255,107,107,0.18)',
            border: '1px solid rgba(255,107,107,0.5)',
            borderRadius: 8,
            fontFamily: brand.font_body, fontSize: 16, fontWeight: 800,
            color: '#FF6B6B', letterSpacing: '2px', textTransform: 'uppercase' as const,
            flexShrink: 0,
          }}>
            Before
          </div>
          <div style={{
            fontFamily: brand.font_headline,
            fontSize: 30, fontWeight: 700,
            color: `${brand.text_color}CC`, lineHeight: 1.25,
            textDecoration: 'line-through',
            textDecorationColor: 'rgba(255,107,107,0.6)',
            textDecorationThickness: '2px',
          }}>
            {beforeText}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${brand.accent_color}, transparent)`,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: 'center',
        }} />

        {/* AFTER card */}
        <div style={{
          opacity: afterOpacity,
          transform: `translateX(${afterX}px)`,
          display: 'flex', alignItems: 'center', gap: 20,
          background: `linear-gradient(135deg, ${brand.accent_color}14, rgba(255,255,255,0.07))`,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${brand.accent_color}55`,
          borderRadius: '0 0 20px 20px',
          padding: '20px 28px',
          boxShadow: `0 8px 40px ${brand.accent_color}22`,
        }}>
          {/* AFTER badge */}
          <div style={{
            paddingLeft: 14, paddingRight: 14, paddingTop: 6, paddingBottom: 6,
            background: `${brand.accent_color}22`,
            border: `1px solid ${brand.accent_color}66`,
            borderRadius: 8,
            fontFamily: brand.font_body, fontSize: 16, fontWeight: 800,
            color: brand.accent_color, letterSpacing: '2px', textTransform: 'uppercase' as const,
            flexShrink: 0,
          }}>
            After
          </div>
          <div style={{
            fontFamily: brand.font_headline,
            fontSize: 30, fontWeight: 800,
            color: brand.text_color, lineHeight: 1.25,
          }}>
            {afterText}
          </div>
          {/* Checkmark */}
          <div style={{
            marginLeft: 'auto',
            width: 44, height: 44, borderRadius: '50%',
            background: `${brand.accent_color}22`,
            border: `2px solid ${brand.accent_color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: brand.accent_color, fontSize: 22,
            boxShadow: `0 0 16px ${brand.accent_color}44`,
          }}>
            ✓
          </div>
        </div>
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
