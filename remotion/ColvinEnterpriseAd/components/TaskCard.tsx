/**
 * TaskCard.tsx
 * A single floating task card that flies in from the right with spring physics.
 * Used in TaskLeakScene to show manual work piling up.
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';

const CATEGORY_COLORS: Record<string, string> = {
  crm:        colvinTheme.colors.electric,
  email:      colvinTheme.colors.cyan,
  'follow-up': colvinTheme.colors.amber,
  reporting:  colvinTheme.colors.green,
  scheduling: colvinTheme.colors.cyan,
  admin:      colvinTheme.colors.red,
};

interface TaskCardProps {
  label:     string;
  category:  string;
  frame:     number;   // current local frame
  startAt:   number;   // frame when this card enters
}

export const TaskCard: React.FC<TaskCardProps> = ({ label, category, frame, startAt }) => {
  const { fps } = useVideoConfig();
  const relFrame = Math.max(0, frame - startAt);

  const entrance = spring({
    frame: relFrame,
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  const wobble = spring({
    frame: Math.max(0, relFrame - 8),
    fps,
    config: { damping: 6, stiffness: 300 },
  });

  const color = CATEGORY_COLORS[category] ?? colvinTheme.colors.electric;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: colvinTheme.colors.navyMid,
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: '16px 20px',
        opacity: entrance,
        transform: `translateX(${(1 - entrance) * 120}px) rotate(${(1 - wobble) * -2}deg)`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 0 ${color}`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: colvinTheme.fonts.body,
          fontSize: 28,
          color: colvinTheme.colors.offWhite,
          fontWeight: 500,
          letterSpacing: '-0.3px',
        }}
      >
        {label}
      </span>
    </div>
  );
};
