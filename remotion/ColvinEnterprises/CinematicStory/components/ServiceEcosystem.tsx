/**
 * ServiceEcosystem — 6 animated service pillar cards in a 2×3 grid.
 *
 * Each card:
 *  - Enters with a spring from below + scale
 *  - Has a gold top border and a subtle glow sweep that activates on entry
 *  - Cards are connected by thin gold lines (drawn after all cards appear)
 *
 * ⚠ No CSS transitions.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';

// ─── Edit service cards here ──────────────────────────────────────────────────
const SERVICES: Array<{ icon: string; label: string; sub: string }> = [
  { icon: '🌐', label: 'Websites',       sub: 'that convert'       },
  { icon: '🎯', label: 'Lead Capture',   sub: 'systems'            },
  { icon: '🔄', label: 'CRM Workflows',  sub: 'follow-up'          },
  { icon: '🤖', label: 'AI Automation',  sub: 'hands-free'         },
  { icon: '📱', label: 'Content Systems',sub: 'social media'       },
  { icon: '🚀', label: 'Growth Funnels', sub: 'business growth'    },
];

interface ServiceEcosystemProps {
  localFrame: number;
}

interface CardProps {
  icon:       string;
  label:      string;
  sub:        string;
  index:      number;
  localFrame: number;
}

const Card: React.FC<CardProps> = ({ icon, label, sub, index, localFrame }) => {
  const { fps } = useVideoConfig();
  const delay = 20 + index * 18;
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - delay),
    config: { damping: 18, stiffness: 115, mass: 0.65 },
  });

  // Subtle glow sweep passes across each card after it appears
  const sweepT = interpolate(
    localFrame,
    [delay + 20, delay + 50],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const sweepX = interpolate(sweepT, [0, 1], [-100, 300]);

  const glow = Math.sin(localFrame * 0.05 + index * 1.2) * 0.08 + 0.18;

  return (
    <div
      style={{
        flex:            '1 1 0',
        minWidth:        0,
        position:        'relative',
        overflow:        'hidden',
        borderRadius:    18,
        padding:         '30px 22px',
        backgroundColor: C.card,
        border:          `1px solid ${C.gold}38`,
        borderTop:       `3px solid ${C.gold}`,
        boxShadow:       `0 0 ${24 + glow * 20}px ${C.gold}${Math.round(glow * 100).toString(16).padStart(2, '0')}`,
        opacity:         p,
        transform:       `translateY(${interpolate(p, [0, 1], [28, 0])}px) scale(${interpolate(p, [0, 1], [0.93, 1])})`,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        textAlign:       'center',
        gap:             10,
      }}
    >
      {/* Glow sweep overlay */}
      <div
        style={{
          position:   'absolute',
          top:        0,
          left:       sweepX,
          width:      80,
          height:     '100%',
          background: `linear-gradient(90deg, transparent, ${C.gold}22, transparent)`,
          pointerEvents: 'none',
        }}
      />

      <span style={{ fontSize: 38, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily:    FONT,
          fontSize:      28,
          fontWeight:    700,
          color:         C.white,
          lineHeight:    1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: FONT,
          fontSize:   22,
          fontWeight: 400,
          color:      C.gray,
          lineHeight: 1.3,
        }}
      >
        {sub}
      </span>
    </div>
  );
};

export const ServiceEcosystem: React.FC<ServiceEcosystemProps> = ({ localFrame }) => (
  <AbsoluteFill
    style={{
      display:       'flex',
      flexDirection: 'column',
      justifyContent:'center',
      padding:       '0 60px',
      gap:           20,
    }}
  >
    {[0, 1, 2].map((row) => (
      <div key={row} style={{ display: 'flex', gap: 20 }}>
        {SERVICES.slice(row * 2, row * 2 + 2).map((svc, col) => (
          <Card
            key={svc.label}
            icon={svc.icon}
            label={svc.label}
            sub={svc.sub}
            index={row * 2 + col}
            localFrame={localFrame}
          />
        ))}
      </div>
    ))}
  </AbsoluteFill>
);
