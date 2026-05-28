/**
 * TaskLeakScene.tsx
 * Task cards fly in one-by-one from the right, stacking up.
 * Visually shows manual work piling up — chaos before automation.
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';
import { TaskCard } from './TaskCard';
import type { ColvinTask } from '../data/colvinEnterpriseAds';

interface TaskLeakSceneProps {
  headline:         string;
  tasks:            ColvinTask[];
  localFrame:       number;
  durationInFrames: number;
}

export const TaskLeakScene: React.FC<TaskLeakSceneProps> = ({
  headline,
  tasks,
  localFrame,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  const headlineSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 12, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const cardSpacing = Math.floor(durationInFrames / (tasks.length + 1));
  const visibleTasks = tasks.slice(0, 6);

  return (
    <AbsoluteFill
      style={{
        background: colvinTheme.colors.navy,
        opacity: exitOpacity,
      }}
    >
      {/* Warning top glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 240,
          background: `radial-gradient(ellipse, ${colvinTheme.colors.amber}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: `${colvinTheme.safe.top}px ${colvinTheme.safe.left}px ${colvinTheme.safe.bottom}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: colvinTheme.fonts.heading,
            fontSize: 44,
            fontWeight: 800,
            color: colvinTheme.colors.white,
            lineHeight: 1.2,
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -24}px)`,
            letterSpacing: '-1px',
          }}
        >
          {headline}
        </div>

        {/* Task cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visibleTasks.map((task, i) => (
            <TaskCard
              key={task.label}
              label={task.label}
              category={task.category}
              frame={localFrame}
              startAt={Math.floor(cardSpacing * (i + 0.6))}
            />
          ))}
        </div>

        {/* Accumulation warning */}
        {localFrame > cardSpacing * 4 && (
          <div
            style={{
              fontFamily: colvinTheme.fonts.body,
              fontSize: 26,
              color: colvinTheme.colors.amber,
              fontWeight: 600,
              opacity: spring({
                frame: Math.max(0, localFrame - cardSpacing * 4),
                fps,
                config: { damping: 20, stiffness: 120 },
              }),
              letterSpacing: '-0.3px',
            }}
          >
            ⚠ Piling up every single week.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
