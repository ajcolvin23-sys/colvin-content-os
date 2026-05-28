/**
 * PainStackScene
 *
 * 2–3 pain points appear in rapid kinetic sequence.
 * Each one punches in from below with a spring, creating emotional tension
 * and the "that's exactly me" recognition moment.
 *
 * Timing: each point appears every ~1.3s (40 frames @ 30fps)
 * Background: OpenAI image if resolved, else brand dark gradient
 * Visual: red accent marks, strike rhythm, tension build
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import type { BrandConfig, SceneDefinition } from '../types';
import { LightSweep } from '../components/LightSweep';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
}

const STAGGER = 40; // frames between each pain point appearing

export const PainStackScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;

  const points = scene.pain_points ?? (scene.body ? [scene.body] : [scene.headline ?? '']);
  const sceneOpacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Image push-in motion
  const imgScale = interpolate(localFrame, [0, durationInFrames], [1.12, 1.0], { extrapolateRight: 'clamp' });
  const imgX     = interpolate(localFrame, [0, durationInFrames], [10, 0],    { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, overflow: 'hidden' }}>

      {/* Background */}
      {imageUrl ? (
        <div style={{ position: 'absolute', inset: '-6%', transform: `translateX(${imgX}px)` }}>
          <Img src={imageUrl} style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
            transform: `scale(${imgScale})`, transformOrigin: 'center center',
          }} />
        </div>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(175deg, ${fallbackColor} 0%, ${brand.background_color} 100%)`,
        }} />
      )}

      {/* Overlays */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, transparent 15%, rgba(0,0,0,0.72) 100%)' }} />}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgb(18,42,90)', opacity: 0.28 }} />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, rgba(0,0,0,0.85) 100%)',
      }} />

      <LightSweep localFrame={localFrame} startFrame={2} duration={18} />

      {/* Section label */}
      <div style={{
        position: 'absolute', top: 148, left: 56, right: 56,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: brand.font_body, fontSize: 20, fontWeight: 800,
          color: '#FF6B6B', letterSpacing: '4px', textTransform: 'uppercase',
          opacity: interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          Sound familiar?
        </div>
      </div>

      {/* Pain points stack */}
      <div style={{
        position: 'absolute',
        top: 200, left: 56, right: 56, bottom: 280,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 36,
      }}>
        {points.map((point, i) => {
          const startFrame = i * STAGGER;
          const pointFrame = Math.max(0, localFrame - startFrame);
          const pointSpring = spring({
            frame: pointFrame,
            fps,
            config: { damping: 16, stiffness: 220, mass: 0.7 },
          });
          const ptOpacity = Math.min(pointSpring, 1);
          const ptY = (1 - pointSpring) * 36;

          // Pulse effect on later frames
          const pulse = interpolate(
            localFrame,
            [startFrame + 20, startFrame + 30, startFrame + 40],
            [1, 1.025, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                opacity: ptOpacity,
                transform: `translateY(${ptY}px) scale(${pulse})`,
                maxWidth: 880,
              }}
            >
              {/* Red dash accent */}
              <div style={{
                width: 32, height: 4, borderRadius: 2,
                background: '#FF6B6B',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(255,107,107,0.6)',
                opacity: ptOpacity,
              }} />

              <div style={{
                fontFamily: brand.font_headline,
                fontSize: points.length === 1 ? 62 : points.length === 2 ? 56 : 50,
                fontWeight: 800,
                color: brand.text_color,
                lineHeight: 1.15,
                letterSpacing: '-1px',
              }}>
                {point}
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
