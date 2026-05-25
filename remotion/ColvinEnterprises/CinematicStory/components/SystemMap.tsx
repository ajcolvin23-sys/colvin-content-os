/**
 * SystemMap — animated hub + spoke workflow visualization.
 *
 * Layout: central "Colvin System" hub with 8 nodes arranged in two columns.
 * Lines draw themselves via pathLength="1" / strokeDashoffset technique.
 * Data pulses travel along each spoke after the line is drawn.
 *
 * ⚠ All animation via interpolate/spring — no CSS transitions or animations.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';

// ─── Node definitions (edit labels/icons here) ────────────────────────────────
const NODES: Array<{
  label:      string;
  icon:       string;
  cx:         number;   // center x in 1080-wide space
  cy:         number;   // center y in 1920-tall space
  startFrame: number;
}> = [
  // Left column
  { label: 'Website',     icon: '🌐', cx: 145, cy: 620,  startFrame: 20  },
  { label: 'CRM',         icon: '👥', cx: 145, cy: 780,  startFrame: 32  },
  { label: 'Content',     icon: '📱', cx: 145, cy: 940,  startFrame: 44  },
  { label: 'Funnel',      icon: '🎯', cx: 145, cy: 1100, startFrame: 56  },
  // Right column
  { label: 'Lead Capture', icon: '📋', cx: 935, cy: 620,  startFrame: 26  },
  { label: 'Follow-Up',   icon: '📧', cx: 935, cy: 780,  startFrame: 38  },
  { label: 'AI Engine',   icon: '🤖', cx: 935, cy: 940,  startFrame: 50  },
  { label: 'Growth',      icon: '📈', cx: 935, cy: 1100, startFrame: 62  },
];

const HUB = { cx: 540, cy: 860 };   // hub center
const NODE_W  = 270;                 // node card width
const NODE_H  = 72;                  // node card height
const HUB_R   = 52;                  // hub circle radius

// Connect from edge of node to hub edge
function nodeEdge(node: typeof NODES[0]): { x: number; y: number } {
  return node.cx < HUB.cx
    ? { x: node.cx + NODE_W / 2, y: node.cy }
    : { x: node.cx - NODE_W / 2, y: node.cy };
}

interface SystemMapProps {
  localFrame: number;
  /** Frame at which lines begin drawing */
  lineStartFrame?: number;
}

interface NodeCardProps {
  label:      string;
  icon:       string;
  cx:         number;
  cy:         number;
  startFrame: number;
  localFrame: number;
}

const NodeCard: React.FC<NodeCardProps> = ({ label, icon, cx, cy, startFrame, localFrame }) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - startFrame),
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });

  const glow = Math.sin(localFrame * 0.06 + startFrame) * 0.12 + 0.22;

  return (
    <g>
      {/* Glow behind card */}
      <rect
        x={cx - NODE_W / 2 - 4}
        y={cy - NODE_H / 2 - 4}
        width={NODE_W + 8}
        height={NODE_H + 8}
        rx={14}
        fill={C.gold}
        opacity={glow * p}
        filter="url(#nodeBlur)"
      />
      {/* Card body */}
      <rect
        x={cx - NODE_W / 2}
        y={cy - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={12}
        fill={C.card}
        stroke={C.gold}
        strokeWidth={1.5}
        strokeOpacity={0.4 * p}
        opacity={p}
      />
      {/* Gold top border */}
      <rect
        x={cx - NODE_W / 2 + 12}
        y={cy - NODE_H / 2}
        width={NODE_W - 24}
        height={3}
        rx={1.5}
        fill={C.gold}
        opacity={p * 0.9}
      />
      {/* Icon */}
      <text
        x={cx - NODE_W / 2 + 28}
        y={cy + 7}
        fontSize={26}
        textAnchor="middle"
        opacity={p}
      >
        {icon}
      </text>
      {/* Label */}
      <text
        x={cx - NODE_W / 2 + 58}
        y={cy + 9}
        fontSize={26}
        fontWeight={600}
        fill={C.white}
        fontFamily={FONT}
        opacity={p}
      >
        {label}
      </text>
    </g>
  );
};

interface SpokeProps {
  node:       typeof NODES[0];
  localFrame: number;
}

const Spoke: React.FC<SpokeProps> = ({ node, localFrame }) => {
  const edge  = nodeEdge(node);
  const lineP = interpolate(
    localFrame,
    [node.startFrame, node.startFrame + 30],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Data pulse: a small circle that travels from node edge → hub, looping every 80 frames
  // Only show after line is mostly drawn
  const pulseVisible = lineP < 0.3;
  const t            = (localFrame % 80) / 80;
  const px           = edge.x + (HUB.cx - edge.x) * t;
  const py           = edge.y + (HUB.cy - edge.y) * t;
  const pulseOpacity = Math.sin(t * Math.PI) * 0.9;

  return (
    <g>
      {/* Line */}
      <line
        x1={edge.x}   y1={edge.y}
        x2={HUB.cx}   y2={HUB.cy}
        stroke={C.gold}
        strokeWidth={1.5}
        strokeOpacity={0.55}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={lineP}
        strokeLinecap="round"
      />
      {/* Data pulse dot */}
      {pulseVisible && (
        <circle
          cx={px}  cy={py}
          r={5}
          fill={C.gold}
          opacity={pulseOpacity * 0.9}
        />
      )}
    </g>
  );
};

export const SystemMap: React.FC<SystemMapProps> = ({
  localFrame,
  lineStartFrame = 0,
}) => {
  const { fps } = useVideoConfig();

  // Hub entrance
  const hubP = spring({
    fps,
    frame:  Math.max(0, localFrame - lineStartFrame),
    config: { damping: 20, stiffness: 80, mass: 0.9 },
  });

  // Hub pulse ring
  const hubRing = Math.sin(localFrame * 0.07) * 0.15 + 0.25;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="nodeBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="hubGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={C.gold}    stopOpacity="0.9" />
            <stop offset="60%"  stopColor={C.goldDeep} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.gold}    stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Spokes */}
        {NODES.map((node) => (
          <Spoke key={node.label} node={node} localFrame={localFrame - lineStartFrame} />
        ))}

        {/* Hub glow */}
        <circle
          cx={HUB.cx} cy={HUB.cy}
          r={HUB_R + 24}
          fill={C.gold}
          opacity={hubRing * hubP}
          filter="url(#hubGlow)"
        />

        {/* Hub circle */}
        <circle
          cx={HUB.cx}  cy={HUB.cy}
          r={HUB_R}
          fill="url(#hubGrad)"
          stroke={C.gold}
          strokeWidth={2}
          strokeOpacity={0.8 * hubP}
          opacity={hubP}
        />

        {/* Hub label */}
        <text
          x={HUB.cx}
          y={HUB.cy - 8}
          fontSize={18}
          fontWeight={700}
          fill={C.white}
          fontFamily={FONT}
          textAnchor="middle"
          opacity={hubP}
        >
          Colvin
        </text>
        <text
          x={HUB.cx}
          y={HUB.cy + 14}
          fontSize={16}
          fontWeight={600}
          fill={C.gold}
          fontFamily={FONT}
          textAnchor="middle"
          opacity={hubP * 0.85}
        >
          System
        </text>

        {/* Node cards */}
        {NODES.map((node) => (
          <NodeCard
            key={node.label}
            {...node}
            localFrame={localFrame - lineStartFrame}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
