/**
 * ProblemStorm — 8 problem cards fly in from off-screen, then compress toward center.
 *
 * Each card has a final resting position spread around the founder silhouette,
 * an entrance direction, and a staggered start frame.
 *
 * ⚠ All animation via interpolate/spring — no CSS transitions.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';
import type { EnterDir } from './FloatingCard';

// ─── Edit problem card copy here ──────────────────────────────────────────────
const PROBLEM_CARDS: Array<{
  label:      string;
  icon:       string;
  enterFrom:  EnterDir;
  finalX:     number;    // px from left — safe within 1080 px canvas
  finalY:     number;    // px from top
  rotation:   number;    // rest rotation degrees
  startFrame: number;    // entrance delay
}> = [
  { label: 'Missed leads',           icon: '📉', enterFrom: 'top-left',     finalX: 60,  finalY: 460, rotation: -3,  startFrame: 0  },
  { label: 'Manual follow-ups',      icon: '📩', enterFrom: 'right',        finalX: 530, finalY: 540, rotation:  2,  startFrame: 12 },
  { label: 'Disconnected tools',     icon: '🔌', enterFrom: 'top-right',    finalX: 80,  finalY: 640, rotation: -2,  startFrame: 22 },
  { label: 'Unposted content',       icon: '📵', enterFrom: 'left',         finalX: 560, finalY: 720, rotation:  3,  startFrame: 32 },
  { label: 'Slow website',           icon: '🐢', enterFrom: 'bottom-left',  finalX: 55,  finalY: 820, rotation: -1,  startFrame: 42 },
  { label: 'No clear funnel',        icon: '🌀', enterFrom: 'right',        finalX: 520, finalY: 900, rotation:  2,  startFrame: 52 },
  { label: 'Too many tabs',          icon: '💻', enterFrom: 'bottom-right', finalX: 70,  finalY: 1000, rotation: -2, startFrame: 62 },
  { label: 'Everything depends on you', icon: '😰', enterFrom: 'bottom', finalX: 200, finalY: 1100, rotation: 0,  startFrame: 74 },
];

interface ProblemStormProps {
  localFrame:  number;
  /** After this frame the cards begin compressing toward center of screen */
  compressAt?: number;
  /** Opacity multiplier for all cards */
  opacity?:    number;
}

interface CardProps {
  label:      string;
  icon:       string;
  enterFrom:  EnterDir;
  finalX:     number;
  finalY:     number;
  rotation:   number;
  startFrame: number;
  localFrame: number;
  compressAt: number;
}

const DIST = 120;

function enterOffset(dir: EnterDir): { dx: number; dy: number } {
  const D = DIST;
  switch (dir) {
    case 'top':          return { dx: 0,       dy: -D      };
    case 'bottom':       return { dx: 0,       dy:  D      };
    case 'left':         return { dx: -D,      dy:  0      };
    case 'right':        return { dx:  D,      dy:  0      };
    case 'top-left':     return { dx: -D*0.7,  dy: -D*0.7  };
    case 'top-right':    return { dx:  D*0.7,  dy: -D*0.7  };
    case 'bottom-left':  return { dx: -D*0.7,  dy:  D*0.7  };
    case 'bottom-right': return { dx:  D*0.7,  dy:  D*0.7  };
  }
}

const StormCard: React.FC<CardProps> = ({
  label, icon, enterFrom, finalX, finalY, rotation,
  startFrame, localFrame, compressAt,
}) => {
  const { fps } = useVideoConfig();

  // Entrance spring
  const entryP = spring({
    fps,
    frame:  Math.max(0, localFrame - startFrame),
    config: { damping: 16, stiffness: 130, mass: 0.55 },
  });

  // Compress toward screen center (540, 960)
  const compressP = interpolate(
    localFrame,
    [compressAt, compressAt + 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const { dx, dy } = enterOffset(enterFrom);
  const enterX = interpolate(entryP, [0, 1], [finalX + dx, finalX]);
  const enterY = interpolate(entryP, [0, 1], [finalY + dy, finalY]);

  const cx = 430;   // compress target x (toward middle-left of founder)
  const cy = 900;
  const x  = enterX + (cx - enterX) * compressP;
  const y  = enterY + (cy - enterY) * compressP;

  const scale = interpolate(compressP, [0, 1], [1, 0.88]);
  const rotDeg = rotation * (1 - entryP) + compressP * (rotation * 0.5);

  return (
    <div
      style={{
        position:    'absolute',
        left:        x,
        top:         y,
        opacity:     entryP,
        transform:   `rotate(${rotDeg}deg) scale(${scale})`,
        backgroundColor: C.card,
        border:      `1px solid ${C.red}55`,
        borderLeft:  `4px solid ${C.red}`,
        borderRadius: 12,
        padding:     '14px 22px',
        display:     'flex',
        alignItems:  'center',
        gap:         12,
        boxShadow:   `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${C.red}22`,
        minWidth:    300,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.white }}>
        {label}
      </span>
    </div>
  );
};

export const ProblemStorm: React.FC<ProblemStormProps> = ({
  localFrame,
  compressAt = 180,
  opacity    = 1,
}) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
    {PROBLEM_CARDS.map((card) => (
      <StormCard
        key={card.label}
        {...card}
        localFrame={localFrame}
        compressAt={compressAt}
      />
    ))}
  </AbsoluteFill>
);
