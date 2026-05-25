/**
 * ParticleField — ambient gold & blue particle layer.
 * Uses fully deterministic values (no Math.random) so every render is identical.
 * Twinkle and slow drift are frame-based (interpolate/sin), never CSS animations.
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// ─── Deterministic particle data ──────────────────────────────────────────────
// Each value is derived from the index using integer arithmetic — consistent every frame.
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  x:      ((i * 73 + 17) % 97) + 1.5,           // 1.5 – 98.5 %
  y:      ((i * 43 + 29) % 97) + 1.5,
  size:   1 + ((i * 13) % 3),                   // 1, 2 or 3 px
  phase:  (i * 37) % 100,                        // twinkling phase  (0-100)
  speed:  0.25 + ((i * 7) % 10) * 0.05,         // 0.25 – 0.70
  drift:  ((i * 11) % 20) - 10,                 // −10 … +10 drift magnitude px
  isGold: (i % 3) !== 0,                         // 2/3 gold · 1/3 blue
}));

interface ParticleFieldProps {
  opacity?: number;   // master opacity multiplier (0–1)
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {PARTICLES.map((p, i) => {
        // Twinkling: deterministic sin — same value every render at same frame
        const twinkle   = Math.sin(frame * p.speed * 0.08 + p.phase) * 0.5 + 0.5;
        const pOpacity  = twinkle * 0.55 + 0.08;   // 0.08 – 0.63
        const driftX    = Math.sin(frame * 0.006 + p.phase * 0.07) * p.drift * 0.06;
        const color     = p.isGold ? '#D4AF37' : '#2F80ED';

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left:     `${p.x + driftX}%`,
              top:      `${p.y}%`,
              width:    p.size,
              height:   p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity:  pOpacity,
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
