/**
 * FinalCTA — premium brand final frame.
 *
 * Visual elements (in order of appearance):
 *  1. Radial gold glow behind brand name
 *  2. Thin flanking lines + dot (ornamental)
 *  3. Brand name — spring entrance
 *  4. Tagline in gold
 *  5. CTA box with URL
 *  6. Closing line at bottom
 *  7. Digital grid overlay (very subtle)
 *
 * ⚠ No CSS transitions.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';

// ─── Edit CTA copy here ───────────────────────────────────────────────────────
const BRAND    = 'Colvin Enterprises';
const TAGLINE  = 'Turning mission into momentum.';
const URL      = 'colvinenterprise.info';
const CLOSING  = 'Build the system. Move the mission.';

interface FinalCTAProps {
  localFrame: number;
}

// ─── Subtle digital grid background ──────────────────────────────────────────
const GridBg: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Vertical lines */}
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={(i + 1) * 108}  y1={0}
          x2={(i + 1) * 108}  y2={1920}
          stroke={C.gold}
          strokeWidth={0.4}
          strokeOpacity={0.07}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}    y1={(i + 1) * 192}
          x2={1080} y2={(i + 1) * 192}
          stroke={C.gold}
          strokeWidth={0.4}
          strokeOpacity={0.07}
        />
      ))}
    </svg>
  </AbsoluteFill>
);

export const FinalCTA: React.FC<FinalCTAProps> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  const glow  = spring({ fps, frame: localFrame,                   config: { damping: 24, stiffness: 50, mass: 1.1 } });
  const brand = spring({ fps, frame: Math.max(0, localFrame - 12), config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const tag   = spring({ fps, frame: Math.max(0, localFrame - 30), config: { damping: 20, stiffness: 90,  mass: 0.8 } });
  const cta   = spring({ fps, frame: Math.max(0, localFrame - 48), config: { damping: 20, stiffness: 90,  mass: 0.8 } });
  const close = spring({ fps, frame: Math.max(0, localFrame - 68), config: { damping: 22, stiffness: 85,  mass: 0.9 } });

  const glowSz  = interpolate(glow,  [0, 1], [0, 640]);
  const lineHW  = interpolate(brand, [0, 1], [0, 65]);
  const gridOp  = interpolate(glow,  [0, 1], [0, 1]);

  // Gold pulse ring
  const pulse = Math.sin(localFrame * 0.06) * 0.06 + 0.22;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bgDeep,
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'center',
        alignItems:      'center',
        padding:         '0 80px',
        overflow:        'hidden',
      }}
    >
      <GridBg opacity={gridOp * 0.6} />

      {/* Radial glow */}
      <div
        style={{
          position:     'absolute',
          width:        glowSz,
          height:       glowSz,
          borderRadius: '50%',
          background:   `radial-gradient(circle, ${C.gold}40 0%, ${C.blue}18 38%, transparent 65%)`,
          top:          '50%',
          left:         '50%',
          transform:    'translate(-50%, -58%)',
          pointerEvents:'none',
          filter:       'blur(4px)',
        }}
      />

      {/* Pulse ring */}
      <div
        style={{
          position:     'absolute',
          width:        glowSz * 1.2,
          height:       glowSz * 1.2,
          borderRadius: '50%',
          border:       `1px solid ${C.gold}`,
          top:          '50%',
          left:         '50%',
          transform:    'translate(-50%, -58%)',
          opacity:      pulse * glow,
          pointerEvents:'none',
        }}
      />

      {/* Flanking ornament — ─── ● ─── */}
      <div
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         18,
          marginBottom: 44,
          opacity:     brand,
        }}
      >
        <div style={{ width: lineHW, height: 2, backgroundColor: C.gold }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: C.gold, opacity: 0.9 }} />
        <div style={{ width: lineHW, height: 2, backgroundColor: C.gold }} />
      </div>

      {/* Brand name */}
      <div
        style={{
          fontFamily:    FONT,
          fontSize:      76,
          fontWeight:    900,
          color:         C.white,
          textAlign:     'center',
          letterSpacing: '-0.025em',
          lineHeight:    1.05,
          marginBottom:  24,
          opacity:       brand,
          transform:     `translateY(${interpolate(brand, [0, 1], [28, 0])}px)`,
        }}
      >
        {BRAND}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily:    FONT,
          fontSize:      34,
          fontWeight:    400,
          color:         C.gold,
          textAlign:     'center',
          letterSpacing: '0.04em',
          marginBottom:  64,
          opacity:       tag,
          transform:     `translateY(${interpolate(tag, [0, 1], [18, 0])}px)`,
        }}
      >
        {TAGLINE}
      </div>

      {/* CTA box */}
      <div
        style={{
          padding:      '28px 56px',
          border:       `2px solid ${C.gold}`,
          borderRadius: 20,
          textAlign:    'center',
          opacity:      cta,
          transform:    `translateY(${interpolate(cta, [0, 1], [20, 0])}px)`,
          boxShadow:    `0 0 40px ${C.gold}22, inset 0 0 30px ${C.gold}0A`,
        }}
      >
        <div
          style={{
            fontFamily:    FONT,
            fontSize:      24,
            fontWeight:    500,
            color:         'rgba(255,255,255,0.5)',
            marginBottom:  10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Visit us at
        </div>
        <div
          style={{
            fontFamily:    FONT,
            fontSize:      44,
            fontWeight:    800,
            color:         C.white,
            letterSpacing: '0.005em',
          }}
        >
          {URL}
        </div>
      </div>

      {/* Closing line */}
      <div
        style={{
          position:      'absolute',
          bottom:        110,
          fontFamily:    FONT,
          fontSize:      24,
          fontWeight:    500,
          color:         'rgba(255,255,255,0.28)',
          textAlign:     'center',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity:       close,
        }}
      >
        {CLOSING}
      </div>
    </AbsoluteFill>
  );
};
