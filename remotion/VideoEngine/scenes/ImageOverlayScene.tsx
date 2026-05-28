/**
 * ImageOverlayScene — CINEMATIC UPGRADE
 *
 * Full-bleed OpenAI-generated image with cinematic motion, mood grading,
 * kinetic typography, light sweep, and vignette.
 *
 * Motion modes (scene.motion_direction):
 *   push_in     — Ken Burns zoom in (default for hook/problem)
 *   pull_back   — Ken Burns zoom out (solution/cta)
 *   drift_left  — slow pan left
 *   drift_right — slow pan right
 *   pan_up      — slow tilt upward
 *   pan_down    — slow tilt downward
 *
 * Color grades (scene.color_grade):
 *   cold     — blue tint: tension, struggle
 *   warm     — amber tint: triumph, warmth
 *   dramatic — deep desaturation
 *   neutral  — minimal tint
 *   none     — no grade
 *
 * Overlay intensity (scene.overlay_intensity):
 *   light 15% / medium 32% (default) / heavy 55%
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

const PROBLEM_TYPES = new Set(['hook', 'problem', 'pain_stack']);
const SOLUTION_TYPES = new Set(['desire', 'solution', 'transformation', 'cta', 'mechanism', 'proof']);

function resolveColorGrade(
  grade: SceneDefinition['color_grade'],
  sceneType: string,
): { color: string; opacity: number } | null {
  const g = grade ?? (PROBLEM_TYPES.has(sceneType) ? 'cold' : SOLUTION_TYPES.has(sceneType) ? 'warm' : 'neutral');
  if (g === 'cold')     return { color: 'rgb(18,42,90)',   opacity: 0.32 };
  if (g === 'warm')     return { color: 'rgb(180,100,20)', opacity: 0.24 };
  if (g === 'dramatic') return { color: 'rgb(8,8,20)',     opacity: 0.45 };
  if (g === 'neutral')  return { color: 'rgb(0,0,0)',      opacity: 0.15 };
  return null; // 'none'
}

function resolveOverlay(intensity: SceneDefinition['overlay_intensity']): number {
  if (intensity === 'light') return 0.15;
  if (intensity === 'heavy') return 0.55;
  return 0.32;
}

export const ImageOverlayScene: React.FC<Props> = ({ scene, brand, localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  const imageUrl      = scene.assets?.[0]?.url;
  const fallbackColor = scene.assets?.[0]?.fallback_color ?? brand.background_color;
  const motionDir     = scene.motion_direction ?? (PROBLEM_TYPES.has(scene.type) ? 'push_in' : 'pull_back');

  // Scene fade
  const sceneOpacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Image motion
  let imgScale = 1.0;
  let imgX = 0;
  let imgY = 0;

  if (motionDir === 'push_in') {
    imgScale = interpolate(localFrame, [0, durationInFrames], [1.18, 1.0], { extrapolateRight: 'clamp' });
    imgX     = interpolate(localFrame, [0, durationInFrames], [14, 0],    { extrapolateRight: 'clamp' });
  } else if (motionDir === 'pull_back') {
    imgScale = interpolate(localFrame, [0, durationInFrames], [1.0, 1.18], { extrapolateRight: 'clamp' });
    imgX     = interpolate(localFrame, [0, durationInFrames], [0, -14],    { extrapolateRight: 'clamp' });
  } else if (motionDir === 'drift_left') {
    imgX     = interpolate(localFrame, [0, durationInFrames], [24, -24], { extrapolateRight: 'clamp' });
    imgScale = 1.08;
  } else if (motionDir === 'drift_right') {
    imgX     = interpolate(localFrame, [0, durationInFrames], [-24, 24], { extrapolateRight: 'clamp' });
    imgScale = 1.08;
  } else if (motionDir === 'pan_up') {
    imgY     = interpolate(localFrame, [0, durationInFrames], [40, -20], { extrapolateRight: 'clamp' });
    imgScale = 1.1;
  } else if (motionDir === 'pan_down') {
    imgY     = interpolate(localFrame, [0, durationInFrames], [-20, 40], { extrapolateRight: 'clamp' });
    imgScale = 1.1;
  }

  // Text animations
  const bodyOpacity = interpolate(localFrame, [14, 24], [0, 1], { extrapolateRight: 'clamp' });
  const bodyY       = interpolate(localFrame, [14, 24], [20, 0], { extrapolateRight: 'clamp' });
  const barScale    = spring({ frame: localFrame, fps, config: { damping: 20 } });

  // Grading
  const grade   = resolveColorGrade(scene.color_grade, scene.type);
  const overlay = resolveOverlay(scene.overlay_intensity);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, overflow: 'hidden' }}>

      {/* OpenAI image or brand color fallback */}
      {imageUrl ? (
        <div style={{ position: 'absolute', inset: '-6%', transform: `translateX(${imgX}px) translateY(${imgY}px)` }}>
          <Img
            src={imageUrl}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              transform: `scale(${imgScale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${fallbackColor}, ${brand.background_color})` }} />
      )}

      {/* Base darkness */}
      {imageUrl && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlay})` }} />}

      {/* Vignette */}
      {imageUrl && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, transparent 18%, rgba(0,0,0,0.68) 100%)',
        }} />
      )}

      {/* Mood color grade */}
      {imageUrl && grade && (
        <div style={{ position: 'absolute', inset: 0, background: grade.color, opacity: grade.opacity }} />
      )}

      {/* Bottom gradient — ensures text over any image */}
      <div style={{
        position: 'absolute', inset: 0,
        background: imageUrl
          ? 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.88) 100%)'
          : 'none',
      }} />

      {/* Top vignette — top text readable */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '300px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 100%)',
      }} />

      {/* Light sweep — cinematic entrance */}
      <LightSweep localFrame={localFrame} startFrame={2} duration={22} />

      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 148, left: 56, right: 56, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 64, height: 5,
          background: brand.accent_color,
          borderRadius: 3,
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left center',
          boxShadow: `0 0 14px ${brand.accent_color}66`,
        }} />
      </div>

      {/* Text content */}
      <div style={{
        position: 'absolute',
        top: 172, left: 56, right: 56, bottom: 280,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24,
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
            staggerFrames={4}
            startDelay={4}
            glowEmphasis
            style={{ textAlign: 'center', maxWidth: '960px' }}
          />
        )}
        {scene.body && (
          <div style={{
            fontFamily: brand.font_body, fontSize: 34, fontWeight: 500,
            color: `${brand.text_color}CC`, textAlign: 'center',
            lineHeight: 1.45, maxWidth: 880,
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
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(8px)',
          padding: '12px 24px', borderRadius: 12, lineHeight: 1.4,
        }}>
          {scene.caption_text}
        </div>
      )}
    </AbsoluteFill>
  );
};
