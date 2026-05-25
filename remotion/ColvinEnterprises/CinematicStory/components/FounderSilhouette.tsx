/**
 * FounderSilhouette — abstract SVG human figure.
 *
 * Visual:  dark silhouette backlit by a gold rim light on the right,
 *          subtle blue on the left.  Holds a glowing laptop.
 *
 * Animation:
 *  - Spring entrance (scale from 0 → 1)
 *  - Frame-based breathing (subtle y-oscillation)
 *  - Gold rim-light pulse
 *
 * ⚠  Uses interpolate / spring only — no CSS animations.
 */

import React from 'react';
import { useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../theme';

export interface FounderSilhouetteProps {
  localFrame:         number;
  /** If true the figure is "frozen" (breathing stops, held at frame 0) */
  frozen?:            boolean;
  /** Master opacity multiplier */
  opacity?:           number;
  /** Vertical offset from bottom anchor, px — positive moves figure up */
  yOffset?:           number;
}

export const FounderSilhouette: React.FC<FounderSilhouetteProps> = ({
  localFrame,
  frozen    = false,
  opacity   = 1,
  yOffset   = 0,
}) => {
  const { fps } = useVideoConfig();

  const entryP = spring({
    fps,
    frame:  localFrame,
    config: { damping: 24, stiffness: 55, mass: 1.2 },
  });

  // Breathing: subtle y oscillation (stops if frozen)
  const breathFrame   = frozen ? 0 : localFrame;
  const breathY       = Math.sin((breathFrame / fps) * Math.PI * 0.55) * 5;

  // Rim light pulse
  const rimPulse      = Math.sin((localFrame / fps) * Math.PI * 0.65) * 0.18 + 0.82;

  // Laptop screen glow flicker (slight)
  const screenGlow    = Math.sin((localFrame / fps) * Math.PI * 1.2) * 0.08 + 0.42;

  const DARK  = '#080A10';   // silhouette fill — very close to bg

  return (
    <div
      style={{
        position:  'absolute',
        bottom:    160 + yOffset,
        left:      '50%',
        transform: `translateX(-50%) translateY(${breathY}px) scale(${entryP})`,
        transformOrigin: 'bottom center',
        opacity:   entryP * opacity,
        width:     260,
        height:    440,
      }}
    >
      <svg
        width="260"
        height="440"
        viewBox="0 0 260 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Backlight glow behind figure */}
          <radialGradient id="backGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor={C.gold} stopOpacity="0.35" />
            <stop offset="50%"  stopColor={C.blue} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0"    />
          </radialGradient>
          {/* Laptop screen gradient */}
          <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.blue}  stopOpacity="0.7" />
            <stop offset="60%"  stopColor={C.gold}  stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.blue}  stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* ── Background glow ellipse ── */}
        <ellipse cx="130" cy="200" rx="110" ry="175" fill="url(#backGlow)" />

        {/* ── Legs ── */}
        <rect x="88"  y="310" width="30" height="110" rx="8"  fill={DARK} />
        <rect x="142" y="310" width="30" height="110" rx="8"  fill={DARK} />

        {/* ── Body / torso ── */}
        <path
          d="M 65 135 Q 130 115 195 135 L 190 318 Q 130 330 70 318 Z"
          fill={DARK}
        />

        {/* ── Left arm ── */}
        <path
          d="M 70 150 L 28 255 Q 22 265 32 270 L 74 168"
          fill={DARK}
          stroke={DARK}
          strokeWidth="3"
        />

        {/* ── Right arm ── */}
        <path
          d="M 190 150 L 232 255 Q 238 265 228 270 L 186 168"
          fill={DARK}
          stroke={DARK}
          strokeWidth="3"
        />

        {/* ── Neck ── */}
        <rect x="115" y="105" width="30" height="30" rx="5" fill={DARK} />

        {/* ── Head ── */}
        <circle cx="130" cy="75" r="48" fill={DARK} />

        {/* ── Laptop in lap ── */}
        {/* Screen */}
        <rect x="68" y="255" width="88" height="62" rx="4" fill="#0A0D16" stroke="#1C2238" strokeWidth="1" />
        <rect x="72" y="259" width="80" height="54" rx="3" fill="url(#screenGrad)" opacity={screenGlow} />
        {/* Screen content lines */}
        <rect x="76" y="264" width="48" height="4" rx="2" fill={C.gold}  opacity="0.5" />
        <rect x="76" y="272" width="64" height="3" rx="2" fill={C.white} opacity="0.25" />
        <rect x="76" y="279" width="52" height="3" rx="2" fill={C.white} opacity="0.2" />
        <rect x="76" y="286" width="38" height="3" rx="2" fill={C.blue}  opacity="0.35" />
        <rect x="76" y="295" width="22" height="5" rx="2" fill={C.gold}  opacity="0.55" />
        {/* Laptop base */}
        <rect x="60" y="317" width="104" height="8" rx="3" fill={DARK} stroke="#1C2238" strokeWidth="1" />

        {/* ── Gold rim light — right side ── */}
        <path
          d="M 188 135 Q 210 195 205 280 Q 202 318 188 335"
          fill="none"
          stroke={C.gold}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={rimPulse * 0.85}
        />
        {/* Head rim */}
        <path
          d="M 158 38 Q 182 65 178 112"
          fill="none"
          stroke={C.gold}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={rimPulse * 0.75}
        />

        {/* ── Blue rim light — left side (subtle) ── */}
        <path
          d="M 72 135 Q 50 195 55 280"
          fill="none"
          stroke={C.blue}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.3}
        />
      </svg>
    </div>
  );
};
