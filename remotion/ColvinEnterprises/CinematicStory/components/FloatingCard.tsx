/**
 * FloatingCard — animated card with entrance from any direction.
 * Used for problem cards (red), service cards (gold), result cards (green).
 * ⚠ No CSS transitions.
 */

import React from 'react';
import { useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';

export type CardVariant = 'problem' | 'service' | 'result';
export type EnterDir   = 'top' | 'bottom' | 'left' | 'right'
                       | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface FloatingCardProps {
  label:       string;
  icon?:       string;
  variant?:    CardVariant;
  enterFrom?:  EnterDir;
  /** local frame at which this card begins its entrance */
  startFrame?: number;
  /** rotate by this many degrees at rest (applied as part of the transform) */
  restRotation?: number;
  localFrame:  number;
  style?:      React.CSSProperties;
}

const DIST = 90;   // entrance travel distance in px

function enterTransform(dir: EnterDir, p: number): string {
  const d = interpolate(p, [0, 1], [DIST, 0]);
  switch (dir) {
    case 'top':          return `translateY(${-d}px)`;
    case 'bottom':       return `translateY(${d}px)`;
    case 'left':         return `translateX(${-d}px)`;
    case 'right':        return `translateX(${d}px)`;
    case 'top-left':     return `translate(${-d * 0.7}px, ${-d * 0.7}px)`;
    case 'top-right':    return `translate(${d * 0.7}px, ${-d * 0.7}px)`;
    case 'bottom-left':  return `translate(${-d * 0.7}px, ${d * 0.7}px)`;
    case 'bottom-right': return `translate(${d * 0.7}px, ${d * 0.7}px)`;
  }
}

const BORDER_COLOR: Record<CardVariant, string> = {
  problem: C.red,
  service: C.gold,
  result:  C.green,
};

export const FloatingCard: React.FC<FloatingCardProps> = ({
  label,
  icon,
  variant     = 'problem',
  enterFrom   = 'bottom',
  startFrame  = 0,
  restRotation = 0,
  localFrame,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - startFrame),
    config: { damping: 17, stiffness: 130, mass: 0.55 },
  });

  const accentColor = BORDER_COLOR[variant];
  const borderStyle = variant === 'service'
    ? { borderTop:  `3px solid ${accentColor}` }
    : { borderLeft: `4px solid ${accentColor}` };

  const rotDeg = restRotation * (1 - p);  // card settles from tilted to upright

  return (
    <div
      style={{
        backgroundColor: C.card,
        border:          `1px solid ${accentColor}33`,
        ...borderStyle,
        borderRadius:    12,
        padding:         '14px 22px',
        display:         'flex',
        alignItems:      'center',
        gap:             12,
        opacity:         p,
        transform:       `${enterTransform(enterFrom, p)} rotate(${rotDeg}deg)`,
        boxShadow:       `0 6px 24px rgba(0,0,0,0.45), 0 0 14px ${accentColor}1A`,
        ...style,
      }}
    >
      {icon && (
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      )}
      <span
        style={{
          fontFamily:    FONT,
          fontSize:      28,
          fontWeight:    600,
          color:         C.white,
          letterSpacing: '-0.01em',
          lineHeight:    1.25,
        }}
      >
        {label}
      </span>
    </div>
  );
};
